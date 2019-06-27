
const path = require('path')
const multer = require('multer')()
const fs = require('fs')
const { assoc, mergeDeepLeft, uniq } = require('ramda')

const { validatorMiddleware } = require('../db/models')
const { compare, makeHash } = require('../auth/bcrypt')
const { makeUser } = require('../db/models/users')
const { getId } = require('../../utils/id')
const { setLoginToken } = require('../auth')
const { render, generateBundle } = require('../render')
const { PUBLIC_ENV_KEYS } = require('../../utils/env')
const blocksApi = require('./blocks')

module.exports = (app, db) => {
  // TODO: move the rest of the routes to their own files
  blocksApi(app, db)
  app.get('/c/api/layout/:id', async (req, res) => {
    try {
      const layout = await db('layout').findOne({ page: req.params.id })
      res.json(layout)
    } catch (error) {
      res.status(500).send(`layout find: ${error.message}`)
    }
  })

  app.post('/c/api/layout/:id/update', validatorMiddleware('layout'), async (req, res) => {
    let bundleName
    try {
      bundleName = await generateBundle(db, req.params.id, req.body.content)
    } catch (error) {
      return res.status(500).send(`Bundle generation error: ${error.message}`)
    }
    try {
      await db('layout').update({ page: req.params.id }, { content: req.body.content, bundleName })
      return res.json({ bundleName })
    } catch (error) {
      return res.status(500).send(`layout save: ${error.message}`)
    }
  })

  /* Pages */
  app.get('/c/api/pages', async (req, res) => {
    try {
      const pages = await db('pages').find()
      res.json(pages)
    } catch (error) {
      res.status(500).send(`Pages find error: ${error.message}`)
    }
  })

  app.put('/c/api/pages', validatorMiddleware('pages'), async (req, res) => {
    try {
      await db('pages').insert(req.body)
      await db('layout').insert({ page: req.body.id, content: [] })
      res.json({ affected: 1 })
    } catch (error) {
      await db('pages').remove({ id: req.body.id })
      await db('layout').remove({ page: req.body.id })
      res.status(500).send(`Pages create error: ${error.message}`)
    }
  })

  app.post('/c/api/pages/:id', validatorMiddleware('pages'), async (req, res) => {
    try {
      const result = await db('pages').update({ id: req.params.id }, req.body)
      res.json({ affected: result.length })
    } catch (error) {
      res.status(500).send(`Pages edit error: ${error.message}`)
    }
  })

  app.post('/c/api/pages/:id/publish', validatorMiddleware('pages'), async (req, res) => {
    try {
      const result = await db('pages').update({ id: req.params.id }, { isPublished: req.body.isPublished })
      res.json({ affected: result.length })
    } catch (error) {
      res.status(500).send(`Pages publish error: ${error.message}`)
    }
  })

  app.delete('/c/api/pages/:id', validatorMiddleware('pages'), async (req, res) => {
    try {
      const result = await db('pages').remove({ id: req.params.id })
      await db('layout').remove({ page: req.params.id })
      res.json({ affected: result.length })
    } catch (error) {
      res.status(500).send(`Pages delete: ${error.message}`)
    }
  })

  app.post('/c/api/upload/image', multer.single('image'), async (req, res) => {
    try {
      const fileName = Date.now() + '-' + req.file.originalname
      const location = path.join(__dirname, `../../../public/assets/upload/${fileName}`)
      fs.writeFileSync(location, req.file.buffer, { encoding: 'binary' })
      return res.json({ fileName })
    } catch (error) {
      res.status(500).send(`Image upload error: ${error.message}`)
    }
  })

  app.get('/c/api/upload/image', (req, res) => {
    try {
      res.send(fs.readdirSync(path.join(__dirname, `../../../public/assets/upload/`)).filter(src => src[0] !== '.').map(src => '/assets/upload/' + encodeURIComponent(src)))
    } catch (error) {
      res.status(500).send(`Images find error: ${error.message}`)
    }
  })

  app.get('/c/api/users/me', async (req, res) => {
    try {
      const result = await db('users').findOne({ id: req.user.id })
      res.json({ email: result.email, role: result.role, created: result.created_at })
    } catch (error) {
      res.status(500).send(`Users find me: ${error.message}`)
    }
  })

  app.post('/c/api/users/me', async (req, res) => {
    try {
      const result = await db('users').update({ id: req.user.id }, { email: req.body.email })
      res.json({ affected: result.length })
    } catch (error) {
      res.status(500).send(`Users update error: ${error.message}`)
    }
  })

  app.post('/c/api/users/me/reset-password', async (req, res) => {
    let user
    const { oldPassword, newPassword, newPasswordRetyped } = req.body
    try {
      user = await db('users').findOne({ id: req.user.id })
    } catch (error) {
      res.status(500).send(`Database error: ${error.message}`)
    }

    const isOldPasswordValid = compare(oldPassword, user.password)
    const isNewPasswordValid = (newPassword && newPassword.length > 5 && newPassword === newPasswordRetyped)
    const canReset = isOldPasswordValid && isNewPasswordValid
    if (!canReset) {
      return res.status(400).send('Invalid passwords')
    }

    try {
      const nextPassword = makeHash(newPassword)
      await db('users').update({ id: user.id }, { password: nextPassword })
      res.json({ affected: 1 })
    } catch (error) {
      res.status(500).send(`Users update me: ${error.message}`)
    }
  })

  app.get('/c/api/env', async (req, res) => {
    try {
      const publicEnv = PUBLIC_ENV_KEYS.reduce((acc, key) => assoc(key, process.env[key], acc), {})
      res.json(publicEnv)
    } catch (error) {
      res.status(500).send(`Users find me: ${error.message}`)
    }
  })
  app.get('/c/api/history', async (req, res) => {
    try {
      const history = await db('history').find(null, { sortBy: 'when', limit: 50 })
      res.json(history)
    } catch (error) {
      res.status(500).send(`History error: ${error.message}`)
    }
  })
  app.put('/c/api/history', validatorMiddleware('history'), async (req, res) => {
    try {
      const event = mergeDeepLeft({ by: req.user.id, when: Date.now() }, req.body)
      await db('history').insert(event)
      res.json(event)
    } catch (error) {
      res.status(500).send(`History error: ${error.message}`)
    }
  })
  app.get('/c/api/site', async (req, res) => {
    try {
      const site = await db('site').findOne()
      res.json(site)
    } catch (error) {
      res.status(500).send(`Site error: ${error.message}`)
    }
  })
  app.put('/c/api/site', validatorMiddleware('site'), async (req, res) => {
    try {
      const site = await db('site').findOne()
      const update = assoc('is_setup_complete', site.is_setup_complete, mergeDeepLeft(req.body, site))
      await db('site').update(null, update)
      res.json({ affected: 1 })
    } catch (error) {
      res.status(500).send(`Site error: ${error.message}`)
    }
  })
  app.put('/c/site/setup', async (req, res) => {
    const hasSite = await db('site').findOne()
    if (hasSite) {
      return res.status(400).send()
    }
    /* req.body = {adminEmail, adminPassword, siteName} */
    try {
      const admin = makeUser({ email: req.body.adminEmail, password: req.body.adminPassword, role: 'admin' })
      await db('users').insert(admin)
      await db('site').insert({ id: getId(), name: req.body.siteName, 'is_setup_complete': true })
      setLoginToken(admin, res, process.env.SECRET)
      return res.json({})
    } catch (error) {
      return res.status(500).send(`Error generating login: ${error.message}`)
    }
  })

  app.get('/c/api/custom', async (req, res) => {
    try {
      const custom = fs.readdirSync('cms/components').filter(componentName => componentName.includes('.js') || componentName.includes('.jsx'))
      res.json({ custom })
    } catch (error) {
      res.status(500).send(`Site error: ${error.message}`)
    }
  })

  app.get('/c/api/class-names', async (req, res) => {
    try {
      const classesFile = fs.readFileSync('public/assets/cms.css').toString()
      const classNames = (classesFile.match(/\.\D.*?{/gim) || []).map(className => {
        return `${className.substring(1).match(/\D.*?[#.\s{]/gim)[0].replace('{', '')}`.trim()
      })
      res.json({ classNames: uniq(classNames) })
    } catch (error) {
      res.status(500).send(`Site error: ${error.message}`)
    }
  })

  app.get('/c*', async (req, res) => {
    res.send(fs.readFileSync('public/index.html').toString())
  })

  app.get('*', async (req, res) => {
    render(req.path, db, res)
  })
}
