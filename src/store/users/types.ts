import { TNormalizedShape } from 'helpers/types/commons'

export type TUsersSlice = TNormalizedShape<TUser> & {
  visitedUserId: TUser['id']
  isPending: boolean
}

export type TUser = {
  id: string
  name: string
  email: string
}

export type TUsersActionPayloads = {
  setUsers: Omit<TUsersSlice, 'isPending'>
  setVisitedUserId: TUser['id']
  setUserOptions: Pick<TUser, 'id'> & Partial<TUser>
}
