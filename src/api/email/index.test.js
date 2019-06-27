const fs = require('fs')
const test = require('tape')
const { injectTestEnv } = require('../../test/api')
const { email, renderEmailForTests, templateVariablesForTests } = require('./index')

injectTestEnv()
const sendEmail = (recipient, email, subject) => new Promise((resolve) => resolve({ recipient, email, subject }))

test('Email - render', t => {
  const file = `hello,yello,tests,hello`
  const replacePairs = [['hello', 'a'], ['yello', 'b'], ['tests', 'c']]
  const rendered = renderEmailForTests(file, replacePairs)

  t.equal(rendered, `a,b,c,a`)
  t.end()
})

test('Email - forgotPassword', async t => {
  const fileName = 'src/api/email/templates/forgot-password.html'
  const params = { recipient: 'a', resetPasswordLink: 'b', siteName: 'c', siteUrl: 'd' }

  const mappedParams = Object.entries(params).map(([key, value]) => [templateVariablesForTests[key], value])
  const emailReplacedManually = renderEmailForTests(fs.readFileSync(fileName).toString(), mappedParams)

  const { recipient, email: emailSentByTest, subject } = await email.forgotPassword(sendEmail, params)
  t.equal(emailSentByTest.length, emailReplacedManually.length, 'String length matches')
  t.equal(recipient, params.recipient, 'recipient matches')
  t.end()
})

test('Email - invite', async t => {
  const fileName = 'src/api/email/templates/invite.html'
  const params = { recipient: 'q', inviteLink: 'w', siteName: 'e', siteUrl: 'r', senderName: 't' }

  const mappedParams = Object.entries(params).map(([key, value]) => [templateVariablesForTests[key], value])
  const emailReplacedManually = renderEmailForTests(fs.readFileSync(fileName).toString(), mappedParams)

  const { recipient, email: emailSentByTest, subject } = await email.invite(sendEmail, params)
  t.equal(emailSentByTest.length, emailReplacedManually.length, 'String length matches')
  t.equal(recipient, params.recipient, 'recipient matches')
  t.end()
})
