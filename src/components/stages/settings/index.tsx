'use client'

import { ChangeEventHandler, FC, MouseEventHandler, ReactNode, useState } from 'react'
import { getWord } from 'app/getWord/client'
import { useGameStore } from 'store/game'
import { TSettings } from 'store/types'
import {
  CATEGORIES_OPTIONS,
  DIFFICULTY_LEVELS_OPTIONS,
  GAME_STAGES,
  GET_WORD_ERROR_MESSAGE,
  PLAY_MODES,
  TOption,
} from 'helpers/constants/app'
import { StageComponent } from 'helpers/types/stage'
import { trackEvent } from 'helpers/utils/analytics'
import { navigate } from 'helpers/utils/gameRouter'
import { combineClassNames } from 'helpers/utils/styles'
import { toast } from 'helpers/utils/toast'
import { CustomButton } from 'components/shared/customButton'
import { IconButton } from 'components/shared/iconButton'
import { BackIcon, ChevronDownIcon } from 'components/shared/icons'
import { Spinner } from 'components/shared/spinner'

const TIME_LIMITATION_OPTIONS: TOption<boolean>[] = [
  { label: 'Ժամանակով', value: true },
  { label: 'Անժամանակ', value: false },
]

const LABEL_CLASSES = 'block p-0 pb-2 text-[1rem] leading-[1.5715] text-black/88'

// What the form controls share; the height follows the text size, like the line it holds
const CONTROL_CLASSES =
  'box-border h-[calc(1rem*1.5714_+_10px)] w-full rounded-md border border-solid px-[11px] text-[1rem] text-black/88 outline-hidden focus-visible:shadow-[0_0_0_1px_var(--secondary-color)] disabled:cursor-not-allowed disabled:bg-black/4 disabled:text-black/25'

// Numbers: an outline in the game's gray on the background art, digits in the system font
const NUMBER_INPUT_CLASSES = combineClassNames(CONTROL_CLASSES, 'border-secondary bg-transparent font-sans')

// Lists: a white field with a light outline and the app font
const SELECT_CLASSES = combineClassNames(
  CONTROL_CLASSES,
  'cursor-pointer appearance-none border-[#d9d9d9] bg-white pr-8 [font-family:inherit]'
)

// The label wraps its control, so a tap on the label focuses it
const Field: FC<{ label: string; children: ReactNode }> = ({ label, children }) => (
  <label className='block'>
    <span className={LABEL_CLASSES}>{label}</span>
    {children}
  </label>
)

type TNumberInputProps = {
  value: number
  min: number
  max: number
  // Reported while the field is empty
  emptyValue: number
  disabled?: boolean
  onChange: (value: number) => void
}

// Reports numbers within range while typing and settles on one when the field loses focus
const NumberInput: FC<TNumberInputProps> = ({ value, min, max, emptyValue, disabled, onChange }) => {
  const [text, setText] = useState(String(value))
  // The value this field last reported or showed; another one coming in (e.g. a reset) replaces the text
  const [shownValue, setShownValue] = useState(value)
  if (value !== shownValue) {
    setShownValue(value)
    setText(String(value))
  }

  const report = (next: number) => {
    setShownValue(next)
    onChange(next)
  }

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const nextText = event.target.value
    setText(nextText)
    if (nextText === '') return report(emptyValue)
    const next = Number(nextText)
    if (Number.isInteger(next) && next >= min && next <= max) report(next)
  }

  const handleBlur = () => {
    if (text === '') return
    const next = Math.min(max, Math.max(min, Math.round(Number(text)) || min))
    setText(String(next))
    report(next)
  }

  return (
    <input
      type='number'
      inputMode='numeric'
      min={min}
      max={max}
      value={text}
      disabled={disabled}
      className={NUMBER_INPUT_CLASSES}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  )
}

type TSelectProps<T extends string> = {
  value: T
  options: TOption<T>[]
  disabled?: boolean
  loading?: boolean
  onChange: (value: T) => void
}

const Select = <T extends string>({ value, options, disabled, loading, onChange }: TSelectProps<T>) => (
  <span className='relative block'>
    <select
      value={value}
      disabled={disabled}
      className={SELECT_CLASSES}
      onChange={(event) => onChange(event.target.value as T)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <span className='pointer-events-none absolute top-1/2 right-[11px] flex -translate-y-1/2 text-[14px] text-black/25'>
      {loading ? <Spinner size='small' /> : <ChevronDownIcon />}
    </span>
  </span>
)

export const Settings: StageComponent = ({ toNextPage }) => {
  const settings = useGameStore((state) => state.settings)
  const isSingleMode = useGameStore((state) => state.mode === PLAY_MODES.single)
  const { minLettersCount, category, difficulty, pointsToWin, timeLimit, withTimeLimit } = settings
  const [isPending, setIsPending] = useState(false)

  const { setGameSettings } = useGameStore.getState()

  const onTimeLimitationChange = (value: boolean) => {
    setGameSettings({ timeLimit: 60, withTimeLimit: value })
  }

  const handleStartGameBtnClick: MouseEventHandler<HTMLButtonElement> = async () => {
    if (isPending) return
    const { startRound, recordGameStarted, mode } = useGameStore.getState()
    if (isSingleMode) {
      setIsPending(true)
      try {
        const result = await getWord({ minLettersCount, category, difficulty })
        startRound(result)
      } catch {
        toast.error(GET_WORD_ERROR_MESSAGE)
        return
      } finally {
        setIsPending(false)
      }
      recordGameStarted()
    }
    trackEvent('game_start', { mode })
    toNextPage()
  }

  const isStartGameDisabled =
    isPending || !minLettersCount || !category || !difficulty || pointsToWin < 1 || timeLimit < 1

  return (
    <>
      <IconButton
        disabled={isPending}
        className='absolute top-[12px] left-[16px] z-2'
        aria-label='Վերադառնալ'
        title='Վերադառնալ'
        onClick={() => navigate(GAME_STAGES.start)}
      >
        <BackIcon />
      </IconButton>
      <div className='box-border flex min-h-[calc(100dvh_-_var(--top-inset)_-_var(--bottom-inset))] flex-col justify-center px-6 py-16 phone-landscape:justify-start phone-landscape:pt-12 phone-landscape:pb-[calc(var(--bottom-inset)_+_1rem)]'>
        <form
          className='flex flex-col gap-5 phone-landscape:grid phone-landscape:grid-cols-2 phone-landscape:gap-x-8 phone-landscape:gap-y-3'
          onSubmit={(event) => event.preventDefault()}
        >
          <div className='flex flex-col gap-5'>
            <fieldset className='m-0 min-w-0 border-0 p-0'>
              <legend className={LABEL_CLASSES}>Ժամանակի սահմանափակում</legend>
              <div className='flex'>
                {TIME_LIMITATION_OPTIONS.map(({ label, value }) => (
                  <label
                    key={label}
                    className='box-border flex h-[32px] flex-1 cursor-pointer items-center justify-center border border-solid border-secondary bg-transparent px-[15px] text-[1rem] leading-[30px] text-secondary transition-colors first:rounded-l-md last:rounded-r-md not-first:border-l-0 has-checked:bg-secondary has-checked:text-white has-disabled:cursor-not-allowed has-disabled:opacity-60 has-focus-visible:outline-2 has-focus-visible:outline-offset-1 has-focus-visible:outline-secondary'
                  >
                    <input
                      type='radio'
                      name='withTimeLimit'
                      className='sr-only'
                      checked={withTimeLimit === value}
                      disabled={isPending}
                      onChange={() => onTimeLimitationChange(value)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            {withTimeLimit && (
              <Field label='Վայրկյան'>
                <NumberInput
                  min={1}
                  max={200}
                  emptyValue={0}
                  value={timeLimit}
                  onChange={(value) => setGameSettings({ timeLimit: value })}
                  disabled={isPending}
                />
              </Field>
            )}
          </div>
          <Field label='Քանիսից է խաղը'>
            <NumberInput
              min={1}
              max={999}
              emptyValue={1}
              value={pointsToWin}
              onChange={(value) => setGameSettings({ pointsToWin: value })}
              disabled={isPending}
            />
          </Field>
          <Field label='Նվազագույն տառերի քանակը'>
            <NumberInput
              min={2}
              max={8}
              emptyValue={3}
              value={minLettersCount}
              onChange={(value) => setGameSettings({ minLettersCount: value })}
              disabled={isPending}
            />
          </Field>
          {isSingleMode && (
            <Field label='Թեմա'>
              <Select<TSettings['category']>
                value={category}
                options={CATEGORIES_OPTIONS}
                onChange={(value) => setGameSettings({ category: value })}
                disabled={isPending}
                loading={isPending}
              />
            </Field>
          )}
          {isSingleMode && (
            <Field label='Բարդության մակարդակ'>
              <Select<TSettings['difficulty']>
                value={difficulty}
                options={DIFFICULTY_LEVELS_OPTIONS}
                onChange={(value) => setGameSettings({ difficulty: value })}
                disabled={isPending}
                loading={isPending}
              />
            </Field>
          )}
        </form>
      </div>
      <CustomButton type='button' disabled={isStartGameDisabled} onClick={handleStartGameBtnClick}>
        <span className='flex items-center justify-center gap-3'>
          {isPending && <Spinner size='small' />}
          <span className={isPending && isSingleMode ? 'text-[.85rem]' : 'text-[1.15rem]'}>
            {isPending && isSingleMode ? 'Արհեստական բանականությունը մտածում է․․․' : 'Սկսել խաղը'}
          </span>
        </span>
      </CustomButton>
    </>
  )
}
