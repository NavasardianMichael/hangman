import { useGameStore } from 'store/game'
import { TPlayer } from 'store/types'
import { PLAYERS } from 'helpers/constants/app'

export const useOpponent = (): TPlayer =>
  useGameStore((state) => (state.currentPlayer === PLAYERS.player1 ? PLAYERS.player2 : PLAYERS.player1))
