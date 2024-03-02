import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { GAME_STAGES, PLAYERS } from 'helpers/constants/app'
import { TAppActionPayloads, TAppSlice } from './types'

const initialState: TAppSlice = {
  currentStage: GAME_STAGES.start,
  currentPlayer: PLAYERS.player1,
  currentWord: ''
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setAppOptions: (state, { payload }: PayloadAction<TAppActionPayloads['setAppOptions']>) => {
      return {
        ...state,
        ...payload,
      }
    },
  },
  extraReducers: (builder) => {
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

export const { setAppOptions } = appSlice.actions

export default appSlice.reducer
