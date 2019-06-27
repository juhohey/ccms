const express = require('express')
const app = express()

const { addLoginRoutes, useAuth } = require('./auth')
const getDb = require('./db')
const addApiRoutes = require('./api')
const { getProvider } = require('./email')
const addMiddleware = require('./middleware')

module.exports = () => {
  app.use('/assets', express.static('public/assets'))
  addMiddleware(app, process.env)
  const db = getDb(process.env)
  const sendEmail = getProvider(process.env)
  useAuth(app, db)
  addLoginRoutes(app, db, sendEmail, process.env)
  addApiRoutes(app, db)
  return app.listen(process.env.PORT)
}
