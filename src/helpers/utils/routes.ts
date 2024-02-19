export const getPatParamBySrc = (src: string): string => {
  const paths = window.location.pathname.split('/')
  return paths.reduce((acc, path, i, arr) => {
    if (acc) return acc
    if (path === src) return arr[i + 1]
    return acc
  }, '')
}
