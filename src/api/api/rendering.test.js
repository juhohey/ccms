require('@babel/register') // Magic babel require wrapper
const got = require('got')

const server = require('../index')
const test = require('tape')
const auth = require('../auth')
const { makeHash } = require('../auth/bcrypt')
const { injectTestEnv, getGotOpts, getDummyContent } = require('../../test/api')
const { getDb } = require('../db/index')
const { renderForTests: render } = require('../render')

const TEST_USER_EMAIL = 'foo@bar.baz'
const TEST_USER_ID = 1
const TEST_DOMAIN_ADDR = 'http://localhost:8010'
const TEST_API_ADDR = 'http://localhost:8010/c/api'
let loginToken
let app
let db

test('API/Render - setup', async t => {
  injectTestEnv()
  app = server()
  db = getDb()
  loginToken = auth.getLoginTokenForTests({ id: TEST_USER_ID }, process.env.SECRET)
  await db('users').insert({ id: TEST_USER_ID, role: 'admin', email: TEST_USER_EMAIL, password: makeHash('a') })
  t.end()
})

test('API/Render', async t => {
  t.plan(2)
  const content = getDummyContent()
  await got.put(`${TEST_API_ADDR}/pages`, getGotOpts({ id: 'b', name: 'a', route: '/test', isPublished: true }, loginToken))
  await got.post(`${TEST_API_ADDR}/layout/b/update`, getGotOpts({ page: 'b', content }, loginToken))

  const dummyRes = await got.get(`${TEST_DOMAIN_ADDR}/test`, getGotOpts({}))
  const layout = await db('layout').findOne({ page: 'b' })
  t.equal(dummyRes.body, render(layout.content, layout.bundleName), 'Page / layout is served')

  await got.post(`${TEST_API_ADDR}/pages/b/publish`, getGotOpts({ isPublished: false }, loginToken))
  try {
    await got.get(`${TEST_DOMAIN_ADDR}/test`, getGotOpts({}))
  } catch (error) {
    t.equal(error.statusCode, 404, 'Page is not rendered when it is unpublished')
  }
})

test('API/Render - teardown', async (t) => {
  await db('users').remove({ id: TEST_USER_ID })
  app.close()
  t.end()
})
