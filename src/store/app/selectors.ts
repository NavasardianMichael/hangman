import { TRootState } from 'store'

export const selectAppOptions = (state: TRootState) => {
    console.log({state});
    
    return state.app
}
