import { selectAppOptions } from 'store/app/selectors'
import { useAppSelector } from './useAppSelector'
import { PLAYERS } from 'helpers/constants/app'
import { useMemo } from 'react'
import { TAppSlice } from 'store/app/types'

export const useOpponent = (): TAppSlice['currentPlayer'] => {
    const { currentPlayer } = useAppSelector(selectAppOptions)
    
    return useMemo(() => {
        return currentPlayer === PLAYERS.player1 ? PLAYERS.player2 : PLAYERS.player1
    }, [currentPlayer])
}