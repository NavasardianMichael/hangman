export type TGetUsersResponse = TUserResponse[]

export type TGetUserResponse = TUserResponse

export type TSetUserOptionsResponse = Pick<TUserResponse, 'id'> & Partial<TUserResponse>

export type TUserResponse = {
  id: number
  name: string
  username: string
  email: string
  address: {
    street: string
    suite: string
    city: string
    zipcode: string
    geo: {
      lat: string
      lng: string
    }
  }
  phone: string
  website: string
  company: {
    name: string
    catchPhrase: string
    bs: string
  }
}
