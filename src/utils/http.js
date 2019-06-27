import { HTTP_FORBIDDEN } from '../app/constants/errors'

const http = async ({ url, method = 'GET', body = {} }) => {
  const params = method === 'GET' ? { method } : { method, body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }
  const res = await window.fetch(url, params)
  if (res.status === 200) {
    const json = await res.json()
    return json
  } else if (res.message === HTTP_FORBIDDEN) {
    window.document.location = '/c/login'
  } else {
    const text = await res.text()
    throw new Error(text)
  }
}

export default http
