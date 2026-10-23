'use client'

import { useGameStore } from 'store/game'
import { GAME_STAGES } from 'helpers/constants/app'
import { StageComponent } from 'helpers/types/stage'
import { leaveGame } from 'helpers/utils/gameFlow'
import { toast } from 'helpers/utils/toast'
import { Button } from 'components/shared/button'
import { CustomButton } from 'components/shared/customButton'
import { CopyIcon, ShareIcon } from 'components/shared/icons'

const SHARE_TEXT = 'Գուշակիր իմ բառը «Կախաղան» խաղում'

// Shown to the challenge creator: the link to send to a friend
export const Share: StageComponent = () => {
  const challengeLink = useGameStore((state) => state.challengeLink)
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(challengeLink)
      toast.success('Հղումը պատճենվեց')
    } catch {
      toast.error('Չհաջողվեց պատճենել, պատճենեք հղումը ձեռքով')
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
    <div className='box-border flex min-h-[calc(100dvh-var(--top-inset)-var(--bottom-inset))] flex-col items-center justify-center gap-5 px-6 py-16 text-center'>
      <h2 className='m-0 text-[1.6rem]'>Մարտահրավերը պատրաստ է</h2>
      <p className='m-0 text-[1rem]'>Ուղարկեք այս հղումը ընկերոջը, որ գուշակի ձեր բառը</p>
      <input
        className='box-border w-full max-w-105 rounded-card border border-solid border-[rgba(35,35,35,0.28)] bg-paper px-3 py-[0.6rem] text-center text-[0.95rem] text-secondary shadow-card select-all'
        value={challengeLink}
        readOnly
        onFocus={(e) => e.currentTarget.select()}
      />
      <div className='flex flex-wrap justify-center gap-3'>
        {canShare && (
          <Button icon={<ShareIcon />} className='min-w-35' onClick={shareLink}>
            Կիսվել
          </Button>
        )}
        <Button icon={<CopyIcon />} className='min-w-35' onClick={copyLink}>
          Պատճենել
        </Button>
      </div>
      <CustomButton onClick={() => leaveGame(GAME_STAGES.share)}>Գլխավոր էջ</CustomButton>
    </div>
  )
}
