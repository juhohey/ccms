const fs = require('fs')
const { prop, propEq, merge } = require('ramda')
const { compare, makeHash } = require('./bcrypt')
const jwt = require('jsonwebtoken')

const { makeUser } = require('../db/models/users')
const { email } = require('../email')
const { makeSiteLink } = require('../../utils/site')
const { getId } = require('../../utils/id')
const { validateEmail } = require('../../utils/string')
const { writeLine: logError } = require('../logging/errors')

const getLoginToken = (user, SECRET) => {
  return jwt.sign({
    user: user.id
  }, SECRET, { expiresIn: '24h' })
}
const setLoginToken = (user, res, SECRET) => {
  const token = getLoginToken(user, SECRET)
  const options = {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    signed: true
  }

  res.cookie('access-token', token, options)
  return res
}

const getInviteUrl = (env, token) => `${makeSiteLink(env)}/c/user/register/${token}`
const getAuthMiddleware = db => async (req, res, next) => {
  // invalid token - synchronous
  try {
    var decoded = jwt.verify(req.signedCookies['access-token'], process.env.SECRET)
  } catch (err) {
    return res.sendStatus(403)
  }
  if (!decoded) {
    return res.sendStatus(403)
  }
  // Edge case - user has a valid token, but the user that it was issued to doesn't exist
  const user = await db('users').findOne({ id: decoded.user })
  if (!user) {
    return res.sendStatus(410)
  }
  req.user = { id: user.id, isAdmin: user.role === 'admin' } // TODO: Role
  next()
}
module.exports = { setLoginToken, getLoginTokenForTests: getLoginToken }
module.exports.addLoginRoutes = (app, db, sendEmail, env) => {
  const authMiddleware = getAuthMiddleware(db)
  app.get(['/c/login', '/c/register', '/c/forgot-password', '/c/forgot-password/:token', '/c/setup'], (req, res) => {
    res.send(fs.readFileSync('public/index.login.html').toString())
  })
  app.get('/c/logout', (req, res) => {
    res.cookie('access-token', { expires: Date.now() })
    res.redirect('/c/login')
  })

  /** Forgot Password */
  app.post('/c/user/forgot-password', async (req, res) => {
    const user = await db('users').findOne({ email: req.body.email })
    if (!user) {
      return res.status(400).send()
    }

    const issued = Date.now().toString()
    const resetPasswordToken = jwt.sign({
      user: user.id,
      issued
    }, env.SECRET, { expiresIn: '24h' })
    const resetPasswordLink = `${makeSiteLink(process.env)}/c/forgot-password/${encodeURIComponent(resetPasswordToken)}`

    // Side effects
    await db('forgot_password').insert({ token: resetPasswordToken, user: user.id, issued, consumed: 0 })
    const site = await db('site').findOne()
    const emailParams = { recipient: user.email, resetPasswordLink, siteName: site.name, siteUrl: makeSiteLink(process.env) }
    const emailRes = await email.forgotPassword(sendEmail, emailParams)
    res.json({ result: emailRes })
  })
  app.post('/c/user/forgot-password/:token', async (req, res) => {
    let verified
    if (req.body.password !== req.body.passwordRetyped) {
      return res.sendStatus(400)
    }
    try {
      verified = jwt.verify(req.params.token, process.env.SECRET)
    } catch (malformedToken) {
      return res.sendStatus(400)
    }

    const user = await db('users').findOne({ id: verified.user })
    const forgotEntry = await db('forgot_password').findOne({ user: user.id, issued: verified.issued, consumed: 0 })
    if (!forgotEntry) {
      return res.sendStatus(410)
    } else {
      await db('forgot_password').update({ user: user.id, issued: verified.issued }, { consumed: 1 })
      await db('users').update({ id: user.id }, { password: makeHash(req.body.password) })
      res.json({})
    }
  })
  app.post('/c/user/login', async (req, res) => {
    const user = await db('users').findOne({ email: req.body.email })
    if (!user) {
      return res.status(400).send()
    }
    const isPasswordMatch = compare(req.body.password, user.password)
    if (!isPasswordMatch) {
      return res.status(404).send()
    } else {
      const resWithToken = setLoginToken(user, res, env.SECRET)
      return resWithToken.json({})
    }
  })
  app.get('/c/user/register/:token/verify', async (req, res) => {
    try {
      jwt.verify(req.params.token, env.SECRET)
      res.json({})
    } catch (error) {
      res.sendStatus(400)
    }
  })
  app.post('/c/user/register/:token', async (req, res) => {
    if (!req.body.password) {
      return res.sendStatus(400)
    }
    try {
      const verified = jwt.verify(req.params.token, env.SECRET)
      const user = await db('users').findOne({ id: verified.user })
      const inviteEntry = await db('user_invites').findOne({ user: user.id, issued: verified.issued, consumed: 0 })
      if (!inviteEntry) {
        return res.sendStatus(410)
      }
      await db('user_invites').update({ user: user.id, issued: verified.issued }, { consumed: 1 })
      await db('users').update({ id: user.id }, { password: makeHash(req.body.password) })
      res.json({})
    } catch (error) {
      res.status(500).send(`Verify error: ${error.message}`)
    }
  })

  /* User invite API */
  app.get('/c/user/invite', authMiddleware, async (req, res) => {
    if (!req.user.isAdmin) {
      return res.sendStatus(400)
    }
    const invites = await db('user_invites').find({ consumed: 0 })
    const users = await db('users').find()
    const invitesWithUrls = invites.map(invite => merge({
      url: getInviteUrl(env, invite.token),
      email: users.find(propEq('id', invite.user)).email
    }, invite)
    )
    res.json({ invites: invitesWithUrls })
  })
  app.delete('/c/user/invite/:id', authMiddleware, async (req, res) => {
    if (!req.user.isAdmin) {
      return res.sendStatus(400)
    }
    const existingInvite = await db('user_invites').findOne({ id: req.params.id })
    if (!existingInvite) {
      return res.sendStatus(404)
    }
    try {
      await db('user_invites').remove({ id: req.params.id })
      await db('users').remove({ id: existingInvite.user })
      res.json({})
    } catch (error) {
      res.status(500).send(`Failed to delete invite: ${error.message}`)
    }
  })
  app.put('/c/user/invite', authMiddleware, async (req, res) => {
    const existingUser = await db('users').findOne({ email: req.body.email })
    if (existingUser || !req.body.email || !validateEmail(req.body.email)) {
      return res.status(400).send()
    }

    const nextUser = makeUser({ email: req.body.email, password: null, role: 'user' })
    await db('users').insert(nextUser)

    const issued = Date.now().toString()
    const inviteToken = jwt.sign({
      user: nextUser.id,
      issued
    }, env.SECRET, {
      expiresIn: '30d'
    })
    await db('user_invites').insert({ id: getId(), user: nextUser.id, issued, token: inviteToken, consumed: 0, emailed: 0 })

    if (!req.body.shouldSendEmailInvite) {
      return res.send({})
    } else {
      const site = await db('site').findOne()
      const sendingUser = await db('users').findOne({ id: req.user.id })
      const emailParams = {
        recipient: nextUser.email,
        inviteLink: getInviteUrl(env, inviteToken),
        siteName: site.name,
        siteUrl: makeSiteLink(process.env),
        senderName: sendingUser.email
      }
      try {
        const result = await email.invite(sendEmail, emailParams)
        await db('user_invites').update({ issued }, { emailed: 1 })
        return res.send({ result })
      } catch (error) {
        logError(error.message)
        res.status(500).send(`failed send email: ${error.message}`)
      }
    }
  })
}

module.exports.useAuth = (app, db) => {
  app.use(['/c/api*'], getAuthMiddleware(db))
}
