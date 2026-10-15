'use client'

import { FC } from 'react'
import { useGameStore } from 'store/game'
import styles from './styles.module.css'

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
    <dl className={styles.stats}>
      {items.map(({ label, value }) => (
        <div key={label} className={styles.item}>
          <dt className={styles.label}>{label}</dt>
          <dd className={styles.value}>{value}</dd>
        </div>
      ))}
    </dl>
  )
}
