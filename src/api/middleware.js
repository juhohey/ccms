const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const path = require('path')
const rfs = require('rotating-file-stream')
const { getLoggingConsole, setErrorLogStream } = require('./logging/errors')

const logPath = path.join(__dirname, '../../logs')

module.exports = (app, env) => {
  app.use(bodyParser.text())
  app.use(bodyParser.json())
  app.use(cookieParser('cookie'))

  if (env.LOG_REQUESTS === 'FILE') {
    const accessLogStream = rfs('access.log', {
      interval: '7d',
      path: logPath
    })
    app.use(morgan('combined', { stream: accessLogStream }))
  }
  if (env.LOG_REQUESTS === 'CONSOLE') {
    app.use(morgan('combined'))
  }
  if (env.LOG_ERRORS === 'FILE') {
    const errorLogStream = rfs('error.log', {
      size: '10M',
      path: logPath
    })
    setErrorLogStream(errorLogStream)
  }
  if (env.LOG_ERRORS === 'CONSOLE') {
    setErrorLogStream(getLoggingConsole())
  }

  return app
}
