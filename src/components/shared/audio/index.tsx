'use client'

import { FC, MediaHTMLAttributes, useEffect, useRef } from 'react'
import { useGameStore } from 'store/game'

type TProps = {
  deps: unknown[]
  src: MediaHTMLAttributes<HTMLAudioElement>['src']
  volume?: number
}

export const Audio: FC<TProps> = ({ deps, src, volume = 1 }) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const soundEnabled = useGameStore((state) => state.soundEnabled)

  useEffect(() => {
    audioRef?.current?.load()
  }, [src])

  useEffect(() => {
    const audio = audioRef?.current
    if (!audio || !useGameStore.getState().soundEnabled) return

    if (deps.every((dep) => !dep)) return

    const timeoutId = setTimeout(() => {
      // Muting during the short delay still wins
      if (!useGameStore.getState().soundEnabled) return
      audio.volume = volume
      // Playback can be blocked (autoplay policy, interrupted load); sounds are optional
      audio.play().catch(() => {})
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      audio.pause()
      audio.currentTime = 0
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  // Muting mid-sound stops it right away
  useEffect(() => {
    if (!soundEnabled) audioRef.current?.pause()
  }, [soundEnabled])

  return <audio ref={audioRef} src={src} preload={soundEnabled ? 'auto' : 'none'} />
}
