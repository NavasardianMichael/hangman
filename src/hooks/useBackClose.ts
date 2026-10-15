import { useEffect, useRef } from 'react'
import { openOverlay } from 'helpers/utils/gameRouter'

// While a dialog is open, the device/browser back gesture closes it instead of leaving the screen
export const useBackClose = (open: boolean, onClose: () => void) => {
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return
    return openOverlay(() => onCloseRef.current())
  }, [open])
}
