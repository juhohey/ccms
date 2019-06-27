let logStream = {
  write: entry => null
}

module.exports.setErrorLogStream = nextLogStream => {
  logStream = nextLogStream
}

module.exports.getLoggingConsole = () => ({ write: entry => console.log(entry) })
module.exports.writeLine = entry => logStream.write(`${new Date().toISOString()} ${entry}\n`)
