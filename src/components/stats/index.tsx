'use client'

import { FC } from 'react'
import { useGameStore } from 'store/game'

// Single-player rounds against the AI
export const StatsPanel: FC = () => {
  const stats = useGameStore((state) => state.stats)
  const roundsPlayed = stats.roundsWon + stats.roundsLost
  const winRate = roundsPlayed ? Math.round((stats.roundsWon / roundsPlayed) * 100) : 0

  const items = [
    { label: 'Գուշակված բառեր', value: stats.roundsWon },
    { label: 'Չգուշակված բառեր', value: stats.roundsLost },
    { label: 'Հաջողություն', value: `${winRate}%` },
    { label: 'Ընթացիկ շարք', value: stats.currentStreak },
    { label: 'Լավագույն շարք', value: stats.bestStreak },
    { label: 'Հաղթած խաղեր', value: `${stats.gamesWon} / ${stats.gamesPlayed}` },
  ]

  return (
    <dl className='m-0 grid grid-cols-2 gap-3'>
      {items.map(({ label, value }) => (
        <div
          key={label}
          className='flex flex-col items-center rounded-card border border-solid border-[rgba(35,35,35,0.22)] bg-paper p-2 text-center shadow-card'
        >
          <dt className='text-[0.85rem]'>{label}</dt>
          <dd className='m-0 text-[1.45rem] font-bold'>{value}</dd>
        </div>
      ))}
    </dl>
  )
}
