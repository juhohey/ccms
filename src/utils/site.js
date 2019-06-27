export const makeSiteLink = (env) => {
  return `http${env.HTTPS === 'TRUE' ? 's' : ''}://${env.DOMAIN}${env.PORT === '80' ? '' : `:${env.PORT}`}`
}

export const removeSiteDomain = (env, url) => {
  const siteDomain = `http${env.HTTPS === 'TRUE' ? 's' : ''}://${env.DOMAIN}${env.PORT === '80' ? '' : `:${env.PORT}`}`
  return url.replace(siteDomain, '')
}
