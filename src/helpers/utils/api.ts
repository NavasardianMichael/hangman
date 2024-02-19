type TFetchArgs = {
  url: string
  queryParams?: Record<string, string>
  params?: RequestInit
}

export const appFetch = async <ExpectedResponse>({
  url,
  queryParams,
  params,
}: TFetchArgs): Promise<ExpectedResponse> => {
  const combinedQueryParams = queryParams ? Object.entries(queryParams).map(([key, value]) => `${key}=${value}`) : ''

  const response = await fetch(url + combinedQueryParams, params)

  const data: ExpectedResponse = await response.json()
  return data
}
