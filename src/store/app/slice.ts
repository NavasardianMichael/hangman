import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { GAME_STAGES, PLAY_MODES, PLAYERS } from 'helpers/constants/app'
import { TAppActionPayloads, TAppSlice } from './types'

export const initialState: TAppSlice = {
  mode: null,
  currentStage: GAME_STAGES.start,
  currentPlayer: PLAYERS.player1,
  currentWord: '',
  points: {
    player1: 0,
    player2: 0
  },
  settings: {
    withTimeLimit: false,
    timeLimit: 60,
    pointsToWin: 10,
    minLettersCount: 3
  }
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setAppOptions: (state, { payload }: PayloadAction<TAppActionPayloads['setAppOptions']>) => {
      console.log({ payload });
      return {
        ...state,
        ...payload,
      }
    },
    setGameSettings: (state, { payload }: PayloadAction<TAppActionPayloads['setGameSettings']>) => {
      state.settings = {
        ...state.settings,
        ...payload,
      }
    },
    incrementCurrentPlayerPoint: (state) => {
      if (state.mode === PLAY_MODES.single) {
        state.points[PLAYERS.player1] += 1
        return
      }
      const opponent = state.currentPlayer === PLAYERS.player1 ? PLAYERS.player2 : PLAYERS.player1
      state.points[opponent] += 1
    },
  },
  extraReducers: (_builder) => {
    // builder
    //   .addCase(getUsersAsync.pending, (state, action) => {
    //     state.isPending = true
    //   })
    //   .addCase(getUsersAsync.fulfilled, (state, action) => {
    //     state.isPending = false
    //   })
    //   .addCase(setUserOptionsAsync.fulfilled, (state, action) => {})
    //   .addMatcher(isRejectedAction, (state, action) => {
    //     // `action` will be inferred as a RejectedAction due to isRejectedAction being defined as a type guard
    //   })
    //   .addDefaultCase((state, action) => {})
  },
})

export const { setAppOptions, setGameSettings, incrementCurrentPlayerPoint } = appSlice.actions

export default appSlice.reducer
