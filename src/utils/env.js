module.exports.getEnvFile = (fs, envFile) => {
  return fs.readFileSync(envFile)
    .toString()
    .trim()
    .split('\n')
    .filter(a => !(a[0] === '#' || a.length === 0))
    .map(keyValue => keyValue.split('='))
}
module.exports.injectKeyValues = keyValues => keyValues.forEach(([key, value]) => {
  if (value === 'FALSE') {
    process.env[key] = false
  } else if (value === 'TRUE') {
    process.env[key] = true
  } else {
    process.env[key] = value
  }
})
module.exports.injectEnvFile = (fs, envFile) => {
  module.exports.injectKeyValues(module.exports.getEnvFile(fs, envFile))
}

module.exports.PUBLIC_ENV_KEYS = [
  'DOMAIN',
  'PORT',
  'HTTPS'
]
