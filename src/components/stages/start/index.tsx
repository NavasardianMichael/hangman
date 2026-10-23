'use client'

import { useState } from 'react'
import { useGameStore } from 'store/game'
import { TPlayMode } from 'store/types'
import { useUiStore } from 'store/ui'
import { useBackClose } from 'hooks/useBackClose'
import { useIsClient } from 'hooks/useIsClient'
import { GAME_STAGES, PLAY_MODES, SUPPORT_URL } from 'helpers/constants/app'
import { StageComponent } from 'helpers/types/stage'
import { getResumeStage } from 'helpers/utils/gameFlow'
import { navigate } from 'helpers/utils/gameRouter'
import { combineClassNames } from 'helpers/utils/styles'
import { DownloadAppBtn } from 'components/downloadAppBtn'
import { Dialog } from 'components/shared/dialog'
import { StatsIcon } from 'components/shared/icons'
import { StatsPanel } from 'components/stats'

const MODE_LABELS: Record<TPlayMode, string> = {
  [PLAY_MODES.single]: 'մեկ հոգով',
  [PLAY_MODES.multiplayer]: 'երկու հոգով',
  [PLAY_MODES.challenge]: 'մարտահրավեր',
}

const START_BTN_CLASSES =
  'box-border flex w-4/5 min-w-[200px] max-w-[400px] cursor-pointer flex-col items-center justify-center gap-0 rounded-card border border-solid border-transparent px-[15px] py-2 text-[1.2rem] leading-[1.3] font-bold whitespace-nowrap text-white transition-[translate,filter,box-shadow] duration-[120ms] ease-[ease] hover:brightness-115 active:translate-y-[2px] phone-landscape:min-h-[2.75rem] phone-landscape:text-[1rem]'

const MODE_BTN_CLASSES = combineClassNames(
  START_BTN_CLASSES,
  'bg-[linear-gradient(100deg,#575757,#575757b9)] shadow-[0_3px_0_rgba(0,0,0,0.28),0_8px_16px_rgba(0,0,0,0.22)] active:shadow-[0_1px_0_rgba(0,0,0,0.28),0_3px_8px_rgba(0,0,0,0.2)]'
)

const CONTINUE_BTN_CLASSES = combineClassNames(
  START_BTN_CLASSES,
  'bg-[linear-gradient(100deg,#2b2b2b,#3d3d3d)] shadow-[0_0_0_2px_rgba(246,243,236,0.9),0_3px_0_rgba(0,0,0,0.28),0_8px_16px_rgba(0,0,0,0.22)] active:shadow-[0_0_0_2px_rgba(246,243,236,0.9),0_1px_0_rgba(0,0,0,0.28),0_3px_8px_rgba(0,0,0,0.2)]'
)

const BTN_TITLE_CLASSES = 'leading-[1.3]'
const BTN_SUBTITLE_CLASSES = 'text-[0.72rem] leading-[1.3] font-normal'

// The server renders this screen. What depends on this device (a saved game, the install hint) shows once the
// page has loaded in the browser.
export const Start: StageComponent = () => {
  const isClient = useIsClient()
  const [statsOpen, setStatsOpen] = useState(false)
  useBackClose(statsOpen, () => setStatsOpen(false))

  // An unfinished game saved from an earlier visit (e.g. the app was closed mid-round)
  const resumeStage = useGameStore(getResumeStage)
  const savedMode = useGameStore((state) => state.mode)

  // Starting another game replaces the saved one, so ask first
  const startMode = (mode: TPlayMode) => {
    const begin = () => {
      const { resetGame, setAppOptions } = useGameStore.getState()
      resetGame()
      setAppOptions({ mode })
      navigate(mode === PLAY_MODES.challenge ? GAME_STAGES.composition : GAME_STAGES.settings)
    }
    if (!resumeStage) return begin()
    useUiStore.getState().openLeaveDialog({ variant: 'new-game', onConfirm: begin })
  }

  return (
    <div
      data-start-screen
      className='relative box-border flex min-h-[calc(100dvh-var(--ad-band-height))] flex-col items-center justify-center gap-[0.85rem] pt-18 pb-[1.35rem] phone-landscape:gap-[0.6rem] phone-landscape:pt-16'
    >
      {/* Sits just under the title band; it and the stats button share the free space, so the buttons stay centred below it */}
      <p className='m-0 mb-auto box-border w-4/5 max-w-100 paper-sheet -rotate-1 px-5 py-1.5 text-center text-[0.95rem] leading-[1.35] font-semibold text-[#2b2b2b] phone-landscape:text-[0.85rem]'>
        Գուշակի՛ր մտապահած հայերեն բառն ըստ նախընտրած թեմայի
      </p>
      {isClient && <DownloadAppBtn />}
      {isClient && resumeStage && savedMode && (
        <button type='button' onClick={() => navigate(resumeStage)} className={CONTINUE_BTN_CLASSES}>
          <span className={BTN_TITLE_CLASSES}>Շարունակել խաղը</span>
          <span className={BTN_SUBTITLE_CLASSES}>{MODE_LABELS[savedMode]}</span>
        </button>
      )}
      <button type='button' onClick={() => startMode(PLAY_MODES.single)} className={MODE_BTN_CLASSES}>
        <span className={BTN_TITLE_CLASSES}>Մեկ հոգով</span>
        <span className={BTN_SUBTITLE_CLASSES}>արհեստական բանականության դեմ</span>
      </button>
      <button type='button' onClick={() => startMode(PLAY_MODES.multiplayer)} className={MODE_BTN_CLASSES}>
        {/* A one-line label keeps the full line height, so this button stays as tall as the two-line ones */}
        <span>Երկու հոգով</span>
      </button>
      <button type='button' onClick={() => startMode(PLAY_MODES.challenge)} className={MODE_BTN_CLASSES}>
        <span className={BTN_TITLE_CLASSES}>Մարտահրավեր</span>
        <span className={BTN_SUBTITLE_CLASSES}>ուղարկիր բառ ընկերոջդ</span>
      </button>
      <button
        type='button'
        className='mb-auto box-border inline-flex h-8 cursor-pointer items-center justify-center gap-2 rounded-card border border-solid border-transparent bg-[rgba(246,243,236,0.92)] px-[15px] text-[14px] font-semibold text-secondary shadow-card'
        onClick={() => setStatsOpen(true)}
      >
        <StatsIcon />
        Վիճակագրություն
      </button>

      <a
        className='absolute right-[0.7rem] bottom-[0.45rem] z-2 m-0 rounded-card bg-[rgba(246,243,236,0.92)] px-[0.45rem] py-[0.15rem] text-[0.62rem] leading-[1.2] font-normal tracking-[0.2px] text-secondary normal-case underline underline-offset-2 shadow-card'
        href={SUPPORT_URL}
        target='_blank'
        rel='noopener noreferrer'
      >
        Աջակցել ծրագրին
      </a>

      <Dialog variant='square' title='Վիճակագրություն' open={statsOpen} onClose={() => setStatsOpen(false)}>
        <StatsPanel />
      </Dialog>
    </div>
  )
}
