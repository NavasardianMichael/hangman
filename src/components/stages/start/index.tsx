'use client'

import { useState } from 'react'
import { BarChartOutlined } from '@ant-design/icons'
import { Button, ConfigProvider, Modal, ThemeConfig } from 'antd'
import { useGameStore } from 'store/game'
import { TPlayMode } from 'store/types'
import { useUiStore } from 'store/ui'
import { useBackClose } from 'hooks/useBackClose'
import { GAME_STAGES, PLAY_MODES, STORE_VARS, SUPPORT_URL } from 'helpers/constants/app'
import { StageComponent } from 'helpers/types/stage'
import { getResumeStage } from 'helpers/utils/gameFlow'
import { navigate } from 'helpers/utils/gameRouter'
import { combineClassNames } from 'helpers/utils/styles'
import { DownloadAppBtn } from 'components/downloadAppBtn'
import { StatsPanel } from 'components/stats'
import styles from './styles.module.css'

const timeoutToHintDownloadApp = 60 * 60 * 1000

const THEME_CONFIG: ThemeConfig = {
  token: {
    colorPrimary: '#575757',
    borderRadius: 0,
    colorBgContainer: '#d3d3d32e',
    colorPrimaryBg: '#575757',
  },
}

const MODE_LABELS: Record<TPlayMode, string> = {
  [PLAY_MODES.single]: 'մեկ հոգով',
  [PLAY_MODES.multiplayer]: 'երկու հոգով',
  [PLAY_MODES.challenge]: 'մարտահրավեր',
}

// The download hint comes back an hour after install, in case the app was removed
const wasAppInstalledRecently = () => {
  const pwaInstalledDate = localStorage.getItem(STORE_VARS.PWA_INSTALLED_DATE)
  return pwaInstalledDate && !isNaN(+pwaInstalledDate) ? Date.now() - +pwaInstalledDate < timeoutToHintDownloadApp : false
}

export const Start: StageComponent = () => {
  const [isAppInstalled] = useState(wasAppInstalledRecently)
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
    <ConfigProvider theme={THEME_CONFIG}>
      <div className={styles.start}>
        {!isAppInstalled && <DownloadAppBtn />}
        {resumeStage && savedMode && (
          <Button type='primary' onClick={() => navigate(resumeStage)} className={combineClassNames(styles.startBtn, styles.continueBtn)}>
            <span className={styles.btnTitle}>Շարունակել խաղը</span>
            <span className={styles.btnSubtitle}>{MODE_LABELS[savedMode]}</span>
          </Button>
        )}
        <Button type='primary' onClick={() => startMode(PLAY_MODES.single)} className={styles.startBtn}>
          <span className={styles.btnTitle}>Մեկ հոգով</span>
          <span className={styles.btnSubtitle}>արհեստական բանականության դեմ</span>
        </Button>
        <Button type='primary' onClick={() => startMode(PLAY_MODES.multiplayer)} className={styles.startBtn}>
          Երկու հոգով
        </Button>
        <Button type='primary' onClick={() => startMode(PLAY_MODES.challenge)} className={styles.startBtn}>
          <span className={styles.btnTitle}>Մարտահրավեր</span>
          <span className={styles.btnSubtitle}>ուղարկիր բառ ընկերոջդ</span>
        </Button>
        <Button
          type='text'
          icon={<BarChartOutlined />}
          className={styles.statsBtn}
          onClick={() => setStatsOpen(true)}
        >
          Վիճակագրություն
        </Button>

        <a className={styles.support} href={SUPPORT_URL} target='_blank' rel='noopener noreferrer'>
          Աջակցել ծրագրին
        </a>

        <Modal
          centered
          title='Վիճակագրություն'
          open={statsOpen}
          onCancel={() => setStatsOpen(false)}
          footer={null}
        >
          <StatsPanel />
        </Modal>
      </div>
    </ConfigProvider>
  )
}
