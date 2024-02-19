import { TUser, TUsersActionPayloads } from 'store/users/types'
import { TGetUsersResponse, TSetUserOptionsResponse, TUserResponse } from './types'

export const processGetUsers = (response: TGetUsersResponse): TUsersActionPayloads['setUsers'] => {
  const initial: TUsersActionPayloads['setUsers'] = {
    byId: {},
    allIds: [],
    visitedUserId: '',
  }

  const processed = response.reduce((acc, user) => {
    const processedUser = processUser(user)
    acc.byId[user.id] = processedUser
    acc.allIds.push(processedUser.id)
    return acc
  }, initial)

  return processed
}

export const processSetUserOptions = (response: TSetUserOptionsResponse): TUsersActionPayloads['setUserOptions'] => {
  return processUserPartially(response)
}

const processUserPartially = (response: TSetUserOptionsResponse): TUsersActionPayloads['setUserOptions'] => {
  const processed: TUsersActionPayloads['setUserOptions'] = {
    id: response.id.toString(),
  }

  if (response.name) processed.name = response.name
  if (response.email) processed.email = response.email

  return processed
}

export const processUser = (response: TUserResponse): TUser => {
  const processed = {
    id: response.id.toString(),
    name: response.name,
    email: response.email,
  }

  return processed
}
