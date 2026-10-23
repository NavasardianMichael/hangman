'use client'

import { FC, useEffect, useRef, useState } from 'react'

type TProps = {
  // Timestamp (ms) the countdown reaches zero at
  deadline: number
  // Milliseconds left, reported on every tick
  onChange: (msLeft: number) => void
  onFinish: () => void
}

// Ticks often enough that a pause saves the time left to within a fraction of a second
const TICK_MS = 100

const pad = (value: number) => String(value).padStart(2, '0')

// mm:ss, counting whole seconds down
const formatTime = (msLeft: number) => {
  const seconds = Math.floor(msLeft / 1000)
  return `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`
}

// The round's timer on a paper label
export const Countdown: FC<TProps> = ({ deadline, onChange, onFinish }) => {
  const [msLeft, setMsLeft] = useState(() => Math.max(0, deadline - Date.now()))
  const callbacksRef = useRef({ onChange, onFinish })

  useEffect(() => {
    callbacksRef.current = { onChange, onFinish }
  })

  useEffect(() => {
    const tick = () => {
      const left = Math.max(0, deadline - Date.now())
      setMsLeft(left)
      callbacksRef.current.onChange(left)
      if (left > 0) return
      clearInterval(intervalId)
      callbacksRef.current.onFinish()
    }
    const intervalId = setInterval(tick, TICK_MS)
    return () => clearInterval(intervalId)
  }, [deadline])

  return (
    <span
      role='timer'
      className='inline-block rounded-card bg-[rgba(246,243,236,0.92)] px-[0.55rem] pt-[0.05rem] pb-[0.15rem] text-[1.35rem] leading-[1.4] text-secondary tabular-nums shadow-card'
    >
      {formatTime(msLeft)}
    </span>
  )
}
