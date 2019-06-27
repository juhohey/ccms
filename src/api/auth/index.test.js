require('@babel/register') // Magic babel require wrapper
const fs = require('fs')
const test = require('tape')
const got = require('got')

const auth = require('./index')
const server = require('../index')
const bcrypt = require('./bcrypt')
const { injectTestEnv, getGotOpts } = require('../../test/api')
const { getDb } = require('../db/index')

const TEST_USER_EMAIL = 'foo@bar.baz'
const TEST_USER_ID = 1
const TEST_USER_PASSWORD = 'test'
let db
let app

test('API - setup', async t => {
  injectTestEnv()
  app = server()
  db = getDb()
  db('site').insert({ id: TEST_USER_ID, name: 'foo' })
  t.end()
})

test('Auth - adds login routes', async t => {
  t.plan(5)
  const loginTemplate = fs.readFileSync(`${process.cwd()}/public/index.login.html`).toString()
  const templateRoutes = ['/c/login', '/c/register', '/c/forgot-password', '/c/forgot-password/:token', '/c/setup']

  for (let i = 0; i < templateRoutes.length; i++) {
    const route = templateRoutes[i]
    const templateRes = await got(`http://localhost:8010${route}`)
    t.equal(templateRes.body, loginTemplate)
  }
  t.end()
})

test('Auth - logout', async t => {
  t.plan(2)
  const res = await got(`http://localhost:8010/c/logout`, { followRedirect: false })
  const setCookieHeaders = res.headers['set-cookie'][0]
  const hasAccessToken = setCookieHeaders.includes('access-token')
  const hasExpires = setCookieHeaders.includes('expires')
  t.equal(hasAccessToken, true, 'has cookie: access-token')
  t.equal(hasExpires, true, 'has cookie: access-token/expires')
})

test('Auth - Forgot password', async t => {
  t.plan(3)
  try {
    await got.post(`http://localhost:8010/c/user/forgot-password`, getGotOpts({ email: TEST_USER_EMAIL }))
  } catch (error) {
    t.equal(error.statusCode, 400, 'no user, response is 400')
  }
  await db('users').insert({ id: TEST_USER_ID, email: TEST_USER_EMAIL })
  const res = await got.post(`http://localhost:8010/c/user/forgot-password`, getGotOpts({ email: TEST_USER_EMAIL }))
  const resetItem = await db('forgot_password').findOne({ user: TEST_USER_ID })

  t.equal(JSON.parse(res.body).result.recipient, TEST_USER_EMAIL)
  t.equal(resetItem.consumed, 0, 'User has a non-consumed reset token')

  // Cleanup
  await db('users').remove({ id: TEST_USER_ID })
  await db('forgot_password').remove({ user: TEST_USER_ID })
})

test('Auth - Forgot password / reset with token', async t => {
  t.plan(4)
  try {
    await got.post(`http://localhost:8010/c/user/forgot-password/asdf`, getGotOpts({}))
  } catch (error) {
    t.equal(error.statusCode, 400, 'no new passwords in body, response is 400')
  }
  try {
    await got.post(`http://localhost:8010/c/user/forgot-password/asdf`, getGotOpts({ password: TEST_USER_PASSWORD, passwordRetyped: TEST_USER_PASSWORD }))
  } catch (error) {
    t.equal(error.statusCode, 400, 'no existing token, response is 400')
  }
  await db('users').insert({ id: TEST_USER_ID, email: TEST_USER_EMAIL })
  await got.post(`http://localhost:8010/c/user/forgot-password`, getGotOpts({ email: TEST_USER_EMAIL }))
  const resetItem = await db('forgot_password').findOne({ user: TEST_USER_ID })
  await got.post(
    `http://localhost:8010/c/user/forgot-password/${resetItem.token}`,
    getGotOpts({ password: TEST_USER_PASSWORD, passwordRetyped: TEST_USER_PASSWORD })
  )

  const user = await db('users').findOne({ id: TEST_USER_ID })
  const usedToken = await db('forgot_password').findOne({ user: TEST_USER_ID })

  const userPasswordIsTheSetOne = bcrypt.compare(TEST_USER_PASSWORD, user.password)
  t.equal(userPasswordIsTheSetOne, true, 'User\'s password is the new one')
  t.equal(usedToken.consumed, 1, 'User has a consumed reset token')

  // Cleanup
  await db('users').remove({ id: TEST_USER_ID })
  await db('forgot_password').remove({ user: TEST_USER_ID })
})

test('Auth - login', async t => {
  t.plan(4)
  try {
    await got.post(`http://localhost:8010/c/user/login`, getGotOpts({}))
  } catch (error) {
    t.equal(error.statusCode, 400, 'no params - 400')
  }
  try {
    await got.post(`http://localhost:8010/c/user/login`, getGotOpts({ email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD }))
  } catch (error) {
    t.equal(error.statusCode, 400, 'no user in db - 400')
  }

  await db('users').insert({ id: TEST_USER_ID, email: TEST_USER_EMAIL, password: bcrypt.makeHash(TEST_USER_PASSWORD) })
  try {
    await got.post(`http://localhost:8010/c/user/login`, getGotOpts({ email: TEST_USER_EMAIL, password: '__foo__' }))
  } catch (error) {
    t.equal(error.statusCode, 404, 'wrong password - 404')
  }
  const res = await got.post(`http://localhost:8010/c/user/login`, getGotOpts({ email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD }))
  const hasAccessToken = res.headers['set-cookie'][0].includes('access-token')
  t.equal(hasAccessToken, true, 'has cookie: access-token')

  // Cleanup
  await db('users').remove({ id: TEST_USER_ID })
})

test('Auth - invite - create/list/delete', async t => {
  const loginToken = auth.getLoginTokenForTests({ id: TEST_USER_ID }, process.env.SECRET)
  t.plan(10)

  await db('users').insert({ id: TEST_USER_ID })
  try {
    await got.put(`http://localhost:8010/c/user/invite`, getGotOpts({}))
  } catch (error) {
    t.equal(error.statusCode, 403, 'No token')
  }

  try {
    await got.put(`http://localhost:8010/c/user/invite`, getGotOpts({}, loginToken))
  } catch (error) {
    t.equal(error.statusCode, 400, 'User is not an admin - cannot invite')
  }

  await db('users').update({ id: TEST_USER_ID }, { role: 'admin' })
  try {
    await got.put(`http://localhost:8010/c/user/invite`, getGotOpts({}, loginToken))
  } catch (error) {
    t.equal(error.statusCode, 400, 'bad params')
  }
  try {
    await got.put(`http://localhost:8010/c/user/invite`, getGotOpts({ email: 'invited@bar.baz' }))
  } catch (error) {
    t.equal(error.statusCode, 403, 'Invite create - no token')
  }

  await got.put(`http://localhost:8010/c/user/invite`, getGotOpts({ email: 'invited@bar.baz' }, loginToken))
  const invitedUser = db('users').findOne({ email: 'invited@bar.baz' })
  const invite = await db('user_invites').findOne({ user: invitedUser.id })
  t.equal(invite.consumed, 0, 'Invited user has an unconsumed token')

  await got.put(`http://localhost:8010/c/user/invite`, getGotOpts({
    email: 'invited2@bar.baz',
    shouldSendEmailInvite: true
  }, loginToken))
  const invitedUserWithEmail = db('users').findOne({ email: 'invited2@bar.baz' })
  const emailedInvite = await db('user_invites').findOne({ user: invitedUserWithEmail.id })
  t.equal(emailedInvite.emailed, 1, 'Invited user has an email sent')

  const invitesRes = await got.get(`http://localhost:8010/c/user/invite`, getGotOpts({}, loginToken))
  const emails = JSON.parse(invitesRes.body).invites.map(invite => invite.email)
  t.deepEqual(emails, ['invited@bar.baz', 'invited2@bar.baz'], 'Invited users can be listed')

  const invitesResIdsTest = await got.get(`http://localhost:8010/c/user/invite`, getGotOpts({}, loginToken))
  const toBeDeletedId = JSON.parse(invitesResIdsTest.body).invites[0].id
  try {
    await got.delete(`http://localhost:8010/c/user/invite/asdf`, getGotOpts({}, loginToken))
  } catch (error) {
    t.equal(error.statusCode, 404, 'Invite delete - bad params')
  }
  try {
    await got.delete(`http://localhost:8010/c/user/invite/asdf`, getGotOpts({}))
  } catch (error) {
    t.equal(error.statusCode, 403, 'Invite delete - no token')
  }
  await got.delete(`http://localhost:8010/c/user/invite/${toBeDeletedId}`, getGotOpts({}, loginToken))
  const deletedInvite = await db('user_invites').findOne({ user: toBeDeletedId })
  t.deepEqual(deletedInvite, undefined, 'Invited users can be deleted')

  // Cleanup
  await db('users').remove({ id: TEST_USER_ID })
  await db('users').remove({ id: invitedUserWithEmail.id })
  await db('users').remove({ id: invitedUser.id })
  await db('user_invites').remove({ user: invitedUserWithEmail.id })
  await db('user_invites').remove({ user: invitedUser.id })
})

test('Auth - register with invite', async t => {
  t.plan(5)
  await db('users').insert({ id: TEST_USER_ID, role: 'admin' })
  const loginToken = auth.getLoginTokenForTests({ id: TEST_USER_ID }, process.env.SECRET)
  await got.put(`http://localhost:8010/c/user/invite`, getGotOpts({ email: 'invited@bar.baz' }, loginToken))

  try {
    await got.get(`http://localhost:8010/c/user/register/asdf/verify`, getGotOpts({}))
  } catch (error) {
    t.equal(error.statusCode, 400, 'Bad token - 400')
  }

  const invites = await got.get(`http://localhost:8010/c/user/invite`, getGotOpts({}, loginToken))
  const invite = JSON.parse(invites.body).invites[0]
  try {
    await got.post(invite.url, getGotOpts({}))
  } catch (error) {
    t.equal(error.statusCode, 400, 'No password - 400')
  }
  await got.post(invite, getGotOpts({ password: '_1_2' }))

  const usedInvite = await db('user_invites').findOne({ id: invite.id })
  const updatedUser = await db('users').findOne({ id: invite.user })
  const userPasswordIsTheSetOne = bcrypt.compare('_1_2', updatedUser.password)
  t.equal(usedInvite.consumed, 1, 'Invite is consumed')
  t.equal(userPasswordIsTheSetOne, true, 'Password is reset')

  try {
    await got.post(invite.url, getGotOpts({ password: '_1_2' }))
  } catch (error) {
    t.equal(error.statusCode, 410, 'Token is consumed - 410')
  }

  // Cleanup
  await db('users').remove({ id: TEST_USER_ID })
  await db('users').remove({ id: invite.user })
  await db('user_invites').remove({ id: invite.id })
})

test('Auth - useAuth', async t => {
  t.plan(4)
  await db('users').insert({ id: TEST_USER_ID })
  const loginToken = auth.getLoginTokenForTests({ id: TEST_USER_ID }, process.env.SECRET)

  try {
    await got.get(`http://localhost:8010/c/api/site`, getGotOpts({}))
  } catch (error) {
    t.equal(error.statusCode, 403, 'denied - /c/api/site')
  }

  try {
    await got.get(`http://localhost:8010/c/api/pages`, getGotOpts({}))
  } catch (error) {
    t.equal(error.statusCode, 403, 'denied - /c/api/pages')
  }

  const res = await got.get(`http://localhost:8010/c/api/site`, getGotOpts({}, loginToken))
  t.equal(res.statusCode, 200, 'success - /c/api/site')

  const regularRes = await got.get(`http://localhost:8010/c/zapi/site`, getGotOpts({}))
  t.equal(regularRes.statusCode, 200, 'success - random route')

  await db('users').remove({ id: TEST_USER_ID })
})

test('teardown', async (t) => {
  await db('site').remove({ id: TEST_USER_ID })
  app.close()
  t.end()
})
