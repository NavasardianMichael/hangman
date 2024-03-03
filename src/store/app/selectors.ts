import { TRootState } from 'store'

export const selectAppOptions = (state: TRootState) => {
    return state.app
}

export const selectPoints = (state: TRootState) => {
    return state.app.points
}
