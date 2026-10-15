'use client'

import { MouseEventHandler, useState } from 'react'
import {
  App,
  Flex,
  Form,
  InputNumber,
  Radio,
  RadioGroupProps,
  RadioProps,
  Select,
  SelectProps,
  Spin,
} from 'antd'
import { getWord } from 'app/getWord/client'
import { useGameStore } from 'store/game'
import {
  CATEGORIES_OPTIONS,
  DIFFICULTY_LEVELS_OPTIONS,
  GAME_STAGES,
  GET_WORD_ERROR_MESSAGE,
  PLAY_MODES,
} from 'helpers/constants/app'
import { StageComponent } from 'helpers/types/stage'
import { trackEvent } from 'helpers/utils/analytics'
import { navigate } from 'helpers/utils/gameRouter'
import { CustomButton } from 'components/shared/customButton'
import { IconButton } from 'components/shared/iconButton'
import { BackIcon } from 'components/shared/icons'
import styles from './styles.module.css'

const TIME_LIMITATION_OPTIONS: RadioGroupProps['options'] = [
  { label: 'Ժամանակով', value: true },
  { label: 'Անժամանակ', value: false },
]

export const Settings: StageComponent = ({ toNextPage }) => {
  const { message: messageApi } = App.useApp()
  const settings = useGameStore((state) => state.settings)
  const isSingleMode = useGameStore((state) => state.mode === PLAY_MODES.single)
  const { minLettersCount, category, difficulty, pointsToWin, timeLimit, withTimeLimit } = settings
  const [isPending, setIsPending] = useState(false)

  const { setGameSettings } = useGameStore.getState()

  const onTimeLimitationChange: RadioProps['onChange'] = (e) => {
    setGameSettings({ timeLimit: 60, withTimeLimit: e.target.value })
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
        messageApi.error(GET_WORD_ERROR_MESSAGE)
        return
      } finally {
        setIsPending(false)
      }
      recordGameStarted()
    }
    trackEvent('game_start', { mode })
    toNextPage()
  }

  const handleCategoryChange: SelectProps['onChange'] = (value) => {
    setGameSettings({ category: value })
  }

  const handleDifficultyChange: SelectProps['onChange'] = (value) => {
    setGameSettings({ difficulty: value })
  }

  const isStartGameDisabled =
    isPending || !minLettersCount || !category || !difficulty || pointsToWin < 1 || timeLimit < 1

  return (
    <>
      <IconButton
        disabled={isPending}
        className={styles.backBtn}
        aria-label='Վերադառնալ'
        title='Վերադառնալ'
        onClick={() => navigate(GAME_STAGES.start)}
      >
        <BackIcon />
      </IconButton>
      <div className={styles.settings}>
        <Form layout='vertical' className={styles.form}>
          <Flex vertical gap={20}>
            <Form.Item label='Ժամանակի սահմանափակում'>
              <Radio.Group
                block
                options={TIME_LIMITATION_OPTIONS}
                value={withTimeLimit}
                onChange={onTimeLimitationChange}
                optionType='button'
                buttonStyle='solid'
                disabled={isPending}
              />
            </Form.Item>
            {withTimeLimit && (
              <Form.Item label='Վայրկյան'>
                <InputNumber
                  min={1}
                  max={200}
                  value={timeLimit}
                  onChange={(value) => setGameSettings({ timeLimit: value ?? 0 })}
                  style={{ background: 'transparent', width: '100%' }}
                  disabled={isPending}
                />
              </Form.Item>
            )}
          </Flex>
          <Form.Item label='Քանիսից է խաղը'>
            <InputNumber
              min={1}
              max={999}
              controls
              value={pointsToWin}
              onChange={(value) => setGameSettings({ pointsToWin: value ?? 1 })}
              style={{ background: 'transparent', width: '100%' }}
              disabled={isPending}
            />
          </Form.Item>
          <Form.Item label='Նվազագույն տառերի քանակը'>
            <InputNumber
              min={2}
              max={8}
              controls
              value={minLettersCount}
              onChange={(value) => setGameSettings({ minLettersCount: value ?? 3 })}
              style={{ background: 'transparent', width: '100%' }}
              disabled={isPending}
            />
          </Form.Item>
          {isSingleMode && (
            <Form.Item label='Թեմա'>
              <Select
                value={category}
                onChange={handleCategoryChange}
                options={CATEGORIES_OPTIONS}
                disabled={isPending}
                loading={isPending}
              />
            </Form.Item>
          )}
          {isSingleMode && (
            <Form.Item label='Բարդության մակարդակ'>
              <Select
                value={difficulty}
                onChange={handleDifficultyChange}
                options={DIFFICULTY_LEVELS_OPTIONS}
                disabled={isPending}
                loading={isPending}
              />
            </Form.Item>
          )}
        </Form>
      </div>
      <CustomButton type='button' disabled={isStartGameDisabled} onClick={handleStartGameBtnClick}>
        <Flex align='center' justify='center' gap={12}>
          {isPending && <Spin size='small' />}
          <span style={{ fontSize: isPending && isSingleMode ? '.85rem' : '1.15rem' }}>
            {isPending && isSingleMode ? 'Արհեստական բանականությունը մտածում է․․․' : 'Սկսել խաղը'}
          </span>
        </Flex>
      </CustomButton>
    </>
  )
}
