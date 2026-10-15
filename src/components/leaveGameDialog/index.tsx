'use client'

import { FC } from 'react'
import { Modal } from 'antd'
import { TLeaveDialogVariant, useUiStore } from 'store/ui'
import { useBackClose } from 'hooks/useBackClose'

const TEXTS: Record<TLeaveDialogVariant, { title: string; body: string; confirm: string; cancel: string }> = {
  game: {
    title: 'Լքե՞լ խաղը',
    body: 'Ընթացիկ խաղը կավարտվի, և արդյունքները կկորչեն։',
    confirm: 'Լքել',
    cancel: 'Մնալ',
  },
  challenge: {
    title: 'Լքե՞լ մարտահրավերը',
    body: 'Ընկերոջ բառը կմնա չգուշակված։',
    confirm: 'Լքել',
    cancel: 'Մնալ',
  },
  'new-game': {
    title: 'Սկսե՞լ նոր խաղ',
    body: 'Դուք ունեք չավարտված խաղ։ Նոր խաղ սկսելու դեպքում այն կավարտվի, և արդյունքները կկորչեն։',
    confirm: 'Նոր խաղ',
    cancel: 'Չեղարկել',
  },
}

// Asks before ending a game in progress (back gesture, home button, starting a new game)
export const LeaveGameDialog: FC = () => {
  const leaveDialog = useUiStore((state) => state.leaveDialog)
  const closeLeaveDialog = useUiStore((state) => state.closeLeaveDialog)
  useBackClose(!!leaveDialog, closeLeaveDialog)

  const texts = TEXTS[leaveDialog?.variant ?? 'game']

  const handleConfirm = () => {
    const onConfirm = leaveDialog?.onConfirm
    closeLeaveDialog()
    onConfirm?.()
  }

  return (
    <Modal
      centered
      open={!!leaveDialog}
      title={texts.title}
      onOk={handleConfirm}
      onCancel={closeLeaveDialog}
      okText={texts.confirm}
      cancelText={texts.cancel}
      okButtonProps={{ danger: true, style: { minWidth: 100 } }}
      cancelButtonProps={{ style: { minWidth: 100 } }}
    >
      <p style={{ textAlign: 'center' }}>{texts.body}</p>
    </Modal>
  )
}
