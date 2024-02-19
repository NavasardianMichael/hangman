import { TUser } from 'store/users/types'
import { appFetch } from 'helpers/utils/api'
import { processGetUsers, processSetUserOptions, processUser } from './processors'
import { TGetUserResponse, TGetUsersResponse, TSetUserOptionsResponse } from './types'

export const getUsers = async () => {
  const response = await appFetch<TGetUsersResponse>({
    url: `${process.env.REACT_APP_URL_BASE}/users`,
  })
  const processed = processGetUsers(response)

  return processed
}

export const getUser = async ({ id }: Pick<TUser, 'id'>) => {
  const response = await appFetch<TGetUserResponse>({
    url: `${process.env.REACT_APP_URL_BASE}users/${id}`,
  })

  const processed = processUser(response)

  return processed
}

export const putUserOptions = async (options: Pick<TUser, 'id'> & Partial<TUser>) => {
  const response = await appFetch<TSetUserOptionsResponse>({
    url: `${process.env.REACT_APP_URL_BASE}/users/${options.id}`,
    params: {
      method: 'PUT',
      body: JSON.stringify(options),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    },
  })
  const processed = processSetUserOptions(response)

  return processed
}
