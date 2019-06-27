export const isString = maybeString => typeof maybeString === 'string'

const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
export const validateEmail = email => emailRegex.test(email)

export const backgroundImagefy = (src) => src
  ? src[0] === 'u'
    ? src
    : `url('${src}')`
  : src

export const unBackgroundImagefy = (src) => src
  ? src[0] === 'u'
    ? src.replace(/url\('(.*?)'\)/, (match, content) => content)
    : src
  : src
