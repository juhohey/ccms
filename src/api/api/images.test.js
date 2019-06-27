require('@babel/register') // Magic babel require wrapper
const got = require('got')
const test = require('tape')
const fs = require('fs')
const FormData = require('form-data')

const server = require('../index')
const auth = require('../auth')
const { makeHash } = require('../auth/bcrypt')
const { injectTestEnv, getGotOpts } = require('../../test/api')
const { getDb } = require('../db/index')

const TEST_USER_EMAIL = 'foo@bar.baz'
const TEST_USER_ID = 1
const TEST_DOMAIN_PORT = 8010
const TEST_DOMAIN_HOST = 'localhost'
const TEST_DOMAIN_ADDR = 'http://localhost:8010'
const TEST_API_ADDR = 'http://localhost:8010/c/api'
let loginToken
let app
let db

test('API/Images - setup', async t => {
  injectTestEnv()
  app = server()
  db = getDb()
  loginToken = auth.getLoginTokenForTests({ id: TEST_USER_ID }, process.env.SECRET)
  await db('users').insert({ id: TEST_USER_ID, role: 'admin', email: TEST_USER_EMAIL, password: makeHash('a') })
  t.end()
})

test('API/Images', async t => {
  t.plan(3)
  try {
    await got.get(`${TEST_API_ADDR}/upload/image`, getGotOpts({}))
  } catch (error) {
    t.equal(error.statusCode, 403, 'get no token, response is 403')
  }
  try {
    await got.post(`${TEST_API_ADDR}/upload/image`, getGotOpts({}))
  } catch (error) {
    t.equal(error.statusCode, 403, 'post no token, response is 403')
  }
  const form = new FormData()
  form.append('image', fs.createReadStream('src/test/test.png'))
  const { headers } = getGotOpts({}, loginToken)
  const formValues = {
    host: TEST_DOMAIN_HOST,
    path: '/c/api/upload/image',
    headers: { cookie: headers.cookie },
    port: TEST_DOMAIN_PORT
  }
  form.submit(formValues, async (err, res) => {
    if (err) {
      console.log('Error while uploading file')
      console.log(err)
    }
    let responseBody = ''
    res.on('data', (chunk) => { responseBody += chunk })
    res.on('end', async () => {
      const fileName = JSON.parse(responseBody).fileName
      const imagesRes = await got.get(`${TEST_API_ADDR}/upload/image`, getGotOpts({}, loginToken))
      const images = JSON.parse(imagesRes.body)
      t.equal(images.some(image => image.includes(fileName)), true, 'Images have been uploaded & can be listed')
      fs.unlinkSync(`public/assets/upload/${fileName}`)
    })
  })
})

test('API/images - teardown', async (t) => {
  await db('users').remove({ id: TEST_USER_ID })
  app.close()
  t.end()
})
