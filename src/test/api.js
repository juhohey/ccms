const { sign } = require('cookie-signature')

module.exports.injectTestEnv = () => {
  const TEST_ENV = {
    EMAIL_PROVIDER: 'test',
    DOMAIN: 'localhost',
    PORT: 8010,
    DB: 'test',
    SECRET: 'D:'
  }
  Object.entries(TEST_ENV).forEach(([key, value]) => (process.env[key] = value))
}

module.exports.getGotOpts = (bodyCandidate, loginToken, rest = {}) => {
  const headers = !loginToken
    ? {
      'Content-Type': 'application/json'
    }
    : {
      'Content-Type': 'application/json',
      cookie: `access-token=s:${sign(loginToken, 'cookie')}`
      // Express adds an s:
      // https://github.com/expressjs/express/blob/0a48e18056865364b2461b2ece7ccb2d1075d3c9/lib/response.js#L845
    }
  try {
    return {
      body: JSON.stringify(bodyCandidate),
      headers,
      ...rest
    }
  } catch (notValidJSON) {
    console.log('Tried to parse but failed', bodyCandidate, notValidJSON.message)
    return {
      body: null,
      headers,
      ...rest
    }
  }
}

module.exports.getDummyContent = () => [{ element: { tag: 'div' }, props: {}, children: ['Hello'] }]
