'use client'

import { CopyOutlined, ShareAltOutlined } from '@ant-design/icons'
import { App, Button, Flex } from 'antd'
import { useGameStore } from 'store/game'
import { GAME_STAGES } from 'helpers/constants/app'
import { StageComponent } from 'helpers/types/stage'
import { leaveGame } from 'helpers/utils/gameFlow'
import { CustomButton } from 'components/shared/customButton'
import styles from './styles.module.css'

const SHARE_TEXT = 'Գուշակիր իմ բառը «Կախաղան» խաղում'

// Shown to the challenge creator: the link to send to a friend
export const Share: StageComponent = () => {
  const { message: messageApi } = App.useApp()
  const challengeLink = useGameStore((state) => state.challengeLink)
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(challengeLink)
      messageApi.success('Հղումը պատճենվեց')
    } catch {
      messageApi.error('Չհաջողվեց պատճենել, պատճենեք հղումը ձեռքով')
    }
  }

  const shareLink = async () => {
    try {
      await navigator.share({ title: 'Կախաղան', text: SHARE_TEXT, url: challengeLink })
    } catch {
      // The share sheet was closed
    }
  }

  return (
    <div className={styles.share}>
      <h2 className={styles.title}>Մարտահրավերը պատրաստ է</h2>
      <p className={styles.caption}>Ուղարկեք այս հղումը ընկերոջը, որ գուշակի ձեր բառը</p>
      <input className={styles.link} value={challengeLink} readOnly onFocus={(e) => e.currentTarget.select()} />
      <Flex gap={12} justify='center' wrap>
        {canShare && (
          <Button type='primary' icon={<ShareAltOutlined />} className={styles.actionBtn} onClick={shareLink}>
            Կիսվել
          </Button>
        )}
        <Button type='primary' icon={<CopyOutlined />} className={styles.actionBtn} onClick={copyLink}>
          Պատճենել
        </Button>
      </Flex>
      <CustomButton onClick={() => leaveGame(GAME_STAGES.share)}>Գլխավոր էջ</CustomButton>
    </div>
  )
}
