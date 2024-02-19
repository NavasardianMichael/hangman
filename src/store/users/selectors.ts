import { TRootState } from 'store'

export const selectUsers = (state: TRootState) => state.users
export const selectVisitedUserId = (state: TRootState) => state.users.visitedUserId
export const selectVisitedUser = (state: TRootState) => state.users.byId[state.users.visitedUserId]
