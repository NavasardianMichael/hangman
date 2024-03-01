import { TRootState } from 'store'

export const selectAppOptions = (state: TRootState) => {
    return state.app
}
