import { PLAY_MODES } from 'helpers/constants/app'
import { TRootState } from 'store'

export const selectAppOptions = (state: TRootState) => {
    return state.app
}

export const selectPoints = (state: TRootState) => {
    return state.app.points
}

export const selectIsSingleMode = (state: TRootState) => state.app.mode === PLAY_MODES.single
export const selectGameSettings = (state: TRootState) => state.app.settings