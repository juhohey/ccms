import { compose, assoc } from 'ramda'
import http from '../../utils/http'
import { showSnack } from '../../utils/snackbar'

const injectApi = (requestParams, useApi = true) => {
  return assoc('url', `/c${useApi ? '/api' : ''}${requestParams.url}`, requestParams)
}
const injectMethod = method => requestParams => assoc('method', method, requestParams)

const tryHttpOnFailLogout = async params => {
  try {
    const result = await http(params)
    return result
  } catch (error) {
    if (error.message === 'Forbidden') {
      showSnack('Login expired. Redirecting to login...')
      setTimeout(() => {
        document.location = '/c/login'
      }, 1500)
    } else {
      throw new Error(error)
    }
  }
}

export default compose(
  http,
  injectApi
)

export const post = compose(
  http,
  injectMethod('POST'),
  injectApi
)
export const get = compose(
  tryHttpOnFailLogout,
  injectMethod('GET'),
  injectApi
)
export const put = compose(
  http,
  injectMethod('PUT'),
  injectApi
)
// reserved word
export const _delete = compose(
  http,
  injectMethod('DELETE'),
  injectApi
)
