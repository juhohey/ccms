require('@babel/register') // Magic babel require wrapper
const got = require('got')
const { prop } = require('ramda')
const fs = require('fs')

const server = require('../index')
const test = require('tape')
const auth = require('../auth')
const { makeHash, compare } = require('../auth/bcrypt')
const { injectTestEnv, getGotOpts, getDummyContent } = require('../../test/api')
const { getDb } = require('../db/index')

const TEST_USER_EMAIL = 'foo@bar.baz'
const TEST_USER_ID = 1
const TEST_USER_PASSWORD = 'test'
const TEST_DOMAIN_ADDR = 'http://localhost:8010'
const TEST_API_ADDR = 'http://localhost:8010/c/api'
let loginToken
let app
let db

test('API - setup', async t => {
  injectTestEnv()
  app = server()
  db = getDb()
  loginToken = auth.getLoginTokenForTests({ id: TEST_USER_ID }, process.env.SECRET)
  await db('users').insert({ id: TEST_USER_ID, role: 'admin', email: TEST_USER_EMAIL, password: makeHash('a') })
  t.end()
})

test('API - pages - Put', async t => {
  t.plan(4)
  const params = { id: 1, name: 'a', route: 'a', isPublished: false, foo: 'bar' }
  try {
    await got.put(`${TEST_API_ADDR}/pages`, getGotOpts(params))
  } catch (error) {
    t.equal(error.statusCode, 403, 'no token, response is 403')
  }
  await got.put(`${TEST_API_ADDR}/pages`, getGotOpts(params, loginToken))
  const pagesCreated = await db('pages').findOne({ route: 'a' })
  const layout = await db('layout').findOne({ page: pagesCreated.id })

  t.notEqual(pagesCreated, undefined, 'Pages exists after creation')
  t.notEqual(layout, undefined, 'Page exists after creation')
  t.equal(pagesCreated.foo, undefined, 'Page does not have props that arent on the model')

  await db('pages').remove({ route: 'a' })
  await db('layout').remove({ page: pagesCreated.id })
})

test('API - pages - Get', async t => {
  t.plan(2)
  try {
    await got.get(`${TEST_API_ADDR}/pages`, getGotOpts())
  } catch (error) {
    t.equal(error.statusCode, 403, 'no token, response is 403')
  }
  await got.put(`${TEST_API_ADDR}/pages`, getGotOpts({ id: 1, name: 'a', route: 'a', isPublished: false, foo: 'bar' }, loginToken))

  const existingRes = await got.get(`${TEST_API_ADDR}/pages`, getGotOpts({}, loginToken))
  const existingPages = JSON.parse(existingRes.body)
  const pages = await db('pages').find()
  t.deepEqual(existingPages, pages, 'Pages are the same as in the db')

  await db('pages').remove({ route: 'a' })
  await db('layout').remove({ page: 1 })
})

test('API - pages - Post', async t => {
  t.plan(3)
  await db('pages').insert({ id: 'a' })
  try {
    await got.post(`${TEST_API_ADDR}/pages/a`, getGotOpts({ name: 'test', nonExistant: 'prop' }))
  } catch (error) {
    t.equal(error.statusCode, 403, 'no token, response is 403')
  }
  await got.post(`${TEST_API_ADDR}/pages/a`, getGotOpts({ name: 'test', nonExistant: 'prop' }, loginToken))
  const pages = await db('pages').findOne({ name: 'test' })
  t.equal(pages.nonExistant, undefined, 'No unknown props')
  t.equal(pages.name, 'test', 'Name is updated')

  await db('pages').remove({ id: 'a' })
})

test('API - pages - Delete', async t => {
  t.plan(3)
  await db('pages').insert({ name: 'test', id: 'asd' })
  try {
    await got.delete(`${TEST_API_ADDR}/pages/a`, getGotOpts())
  } catch (error) {
    t.equal(error.statusCode, 403, 'no token, response is 403')
  }
  await got.delete(`${TEST_API_ADDR}/pages/asd`, getGotOpts({}, loginToken))
  const pages = await db('pages').find({ id: 'asd' })
  const layout = await db('layout').find({ page: 'asd' })
  t.deepEqual(pages, [], 'pages are deleted')
  t.deepEqual(layout, [], 'layout is deleted')
})

test('API - Pages - publish', async t => {
  t.plan(3)
  await db('pages').insert({ name: 'test', id: 'aaa' })
  try {
    await got.get(`${TEST_API_ADDR}/pages/a/publish`, getGotOpts({}))
  } catch (error) {
    t.equal(error.statusCode, 403, 'no token, response is 403')
  }

  await got.post(`${TEST_API_ADDR}/pages/aaa/publish`, getGotOpts({ isPublished: true }, loginToken))
  const pagePublished = await db('pages').findOne({ id: 'aaa' })

  t.equal(pagePublished.isPublished, true, 'Can publish pages')

  await got.post(`${TEST_API_ADDR}/pages/aaa/publish`, getGotOpts({ isPublished: false }, loginToken))
  const pageUnpublished = await db('pages').findOne({ id: 'aaa' })
  t.equal(pageUnpublished.isPublished, false, 'Can unpublish pages')
})

test('API - layout - Get', async t => {
  t.plan(3)
  try {
    await got.get(`${TEST_API_ADDR}/layout/a`, getGotOpts())
  } catch (error) {
    t.equal(error.statusCode, 403, 'no token, response is 403')
  }

  await got.put(`${TEST_API_ADDR}/pages`, getGotOpts({ id: 'a', name: 'a', route: 'a', isPublished: false, foo: 'bar' }, loginToken))
  const existingRes = await got.get(`${TEST_API_ADDR}/layout/a`, getGotOpts({}, loginToken))
  const layout = await db('layout').findOne({ page: 'a' })

  const existingLayouts = JSON.parse(existingRes.body)
  t.equal(layout.page, 'a', 'layout exists after page creation')
  t.deepEqual(layout, existingLayouts, 'layout res matches the db one')

  await db('pages').remove({ id: 'a' })
  await db('layout').remove({ page: 'a' })
})

test('API - layout - Post (& Bundle gen.)', async t => {
  t.plan(4)
  try {
    await got.get(`${TEST_API_ADDR}/layout/a`, getGotOpts())
  } catch (error) {
    t.equal(error.statusCode, 403, 'no token, response is 403')
  }

  const content = getDummyContent()
  await got.put(`${TEST_API_ADDR}/pages`, getGotOpts({ id: 'd', name: 'a', route: 'a', isPublished: false, foo: 'bar' }, loginToken))
  console.log('Req')
  const bundleNameRes = await got.post(`${TEST_API_ADDR}/layout/d/update`, getGotOpts({ page: 'd', content, foo: 'bar' }, loginToken))
  const layout = await db('layout').findOne({ page: 'd' })

  t.deepEqual(layout.content, content, 'layout content updates')
  t.equal(layout.bundleName, `page.d.bundle.js`, 'layout bundle is generated')
  t.equal(layout.foo, undefined, 'no unknown props')

  fs.unlinkSync(`public/assets/bundles/${JSON.parse(bundleNameRes.body).bundleName}`)

  await db('pages').remove({ id: 'd' })
  await db('layout').remove({ page: 'd' })
})

test('API - Users/Me - Get', async t => {
  t.plan(2)
  try {
    await got.get(`${TEST_API_ADDR}/users/me`, getGotOpts())
  } catch (error) {
    t.equal(error.statusCode, 403, 'no token, response is 403')
  }

  const meRes = await got.get(`${TEST_API_ADDR}/users/me`, getGotOpts({}, loginToken))
  t.equal(JSON.parse(meRes.body).email, TEST_USER_EMAIL, 'Test user has correct email')
})

test('API - Users/Me - Post', async t => {
  t.plan(2)
  try {
    await got.post(`${TEST_API_ADDR}/users/me`, getGotOpts({}))
  } catch (error) {
    t.equal(error.statusCode, 403, 'no token, response is 403')
  }

  await got.post(`${TEST_API_ADDR}/users/me`, getGotOpts({ email: 'tes@test.test' }, loginToken))
  const me = await db('users').findOne({ id: TEST_USER_ID })

  t.equal(me.email, 'tes@test.test', 'Test user can update email')

  await db('users').update({ id: TEST_USER_ID }, { email: TEST_USER_EMAIL })
})

test('API - Users/Me - Reset password', async t => {
  t.plan(5)
  try {
    await got.post(`${TEST_API_ADDR}/users/me/reset-password`, getGotOpts({}))
  } catch (error) {
    t.equal(error.statusCode, 403, 'no token, response is 403')
  }

  try {
    const badOldPass = { oldPassword: 'b' }
    await got.post(`${TEST_API_ADDR}/users/me/reset-password`, getGotOpts(badOldPass, loginToken))
  } catch (error) {
    t.equal(error.statusCode, 400, 'Bad old pw')
  }

  try {
    const badNewPass = { oldPassword: 'a', newPassword: 'b', newPasswordRetyped: 'c' }
    await got.post(`${TEST_API_ADDR}/users/me/reset-password`, getGotOpts(badNewPass, loginToken))
  } catch (error) {
    t.equal(error.statusCode, 400, 'Bad new pw')
  }

  try {
    const badNewPass = { oldPassword: 'a', newPassword: 'b', newPasswordRetyped: 'b' }
    await got.post(`${TEST_API_ADDR}/users/me/reset-password`, getGotOpts(badNewPass, loginToken))
  } catch (error) {
    t.equal(error.statusCode, 400, 'Bad new pw vol 2')
  }

  const newPass = { oldPassword: 'a', newPassword: 'bbbbbb', newPasswordRetyped: 'bbbbbb' }
  await got.post(`${TEST_API_ADDR}/users/me/reset-password`, getGotOpts(newPass, loginToken))
  const me = await db('users').findOne({ id: TEST_USER_ID })
  t.equal(compare('bbbbbb', me.password), true, 'Test user can reset pw')
})

test('API - History', async t => {
  t.plan(4)
  try {
    await got.get(`${TEST_API_ADDR}/history`, getGotOpts({}))
  } catch (error) {
    t.equal(error.statusCode, 403, 'get no token, response is 403')
  }

  try {
    await got.put(`${TEST_API_ADDR}/history`, getGotOpts({}))
  } catch (error) {
    t.equal(error.statusCode, 403, 'put no token, response is 403')
  }

  await got.put(`${TEST_API_ADDR}/history`, getGotOpts({ action: 'FOO', foo: 'bar' }, loginToken))
  await got.put(`${TEST_API_ADDR}/history`, getGotOpts({ action: 'BAR' }, loginToken))
  const historyRes = await got.get(`${TEST_API_ADDR}/history`, getGotOpts({}, loginToken))
  const history = JSON.parse(historyRes.body)
  t.equal(history[1].foo, undefined, 'No unknown props')
  t.deepEqual(history.map(prop('action')), ['BAR', 'FOO'], 'Correct order')
})

test('API - Site', async t => {
  t.plan(4)
  await db('site').insert({ id: TEST_USER_ID, name: 'BAR', is_setup_complete: true })
  try {
    await got.get(`${TEST_API_ADDR}/site`, getGotOpts({}))
  } catch (error) {
    t.equal(error.statusCode, 403, 'get no token, response is 403')
  }

  try {
    await got.put(`${TEST_API_ADDR}/site`, getGotOpts({}))
  } catch (error) {
    t.equal(error.statusCode, 403, 'put no token, response is 403')
  }

  await got.put(`${TEST_API_ADDR}/site`, getGotOpts({ name: 'FOO', is_setup_complete: false }, loginToken))
  const siteRes = await got.get(`${TEST_API_ADDR}/site`, getGotOpts({}, loginToken))
  const site = JSON.parse(siteRes.body)

  t.equal(site.name, 'FOO', 'Name is updated')
  t.deepEqual(site.is_setup_complete, true, 'Setup cannot be uncompleted')

  await db('site').remove({ name: 'FOO' })
})

test('API - Setup', async t => {
  t.plan(4)
  // got retries on server error https://github.com/sindresorhus/got#retry
  await got.put(
    `${TEST_DOMAIN_ADDR}/c/site/setup`,
    getGotOpts({ adminEmail: 'asd@asd.asd', adminPassword: 'asd', siteName: '__' }, null, { retry: { statusCodes: [408] } })
  )
  const admin = await db('users').findOne({ email: 'asd@asd.asd' })
  const site = await db('site').findOne()
  t.equal(compare('asd', admin.password), true, 'Admin user created with password')
  t.equal(admin.role, 'admin', 'Admin user created as admin')
  t.equal(site.name, '__', 'Site is updated')
  t.equal(site.is_setup_complete, true, 'Site setup is complete')

  await db('site').remove({ id: TEST_USER_ID })
  await db('users').remove({ email: 'asd@asd.asd' })
})

test('API/Template', async t => {
  t.plan(1)
  const res = await got.get(
    `${TEST_DOMAIN_ADDR}/c/asdf`,
    getGotOpts({})
  )
  const template = fs.readFileSync('public/index.html').toString()

  t.equal(res.body, template, 'Template is served')
})

test('Api - teardown', async (t) => {
  await db('users').remove({ id: TEST_USER_ID })
  app.close()
  t.end()
})
