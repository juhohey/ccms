const lowdb = require('./ lowdb')

let db
module.exports = env => {
  if (db) return db
  switch (env.DB) {
    case 'test':
      db = lowdb({ isMemory: true })
      break
    case 'file':
    default:
      db = lowdb({})
  }
  return db
}

module.exports.getDb = () => db
