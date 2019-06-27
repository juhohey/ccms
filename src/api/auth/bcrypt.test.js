const test = require('tape')
const crypt = require('./bcrypt')

test('Make hash', t => {
  const hash = crypt.makeHash('test')
  const notEqualHash = crypt.makeHash('test')
  t.notEqual(hash, 'test')
  t.notEqual(hash, notEqualHash)
  t.end()
})
test('Compare hash', t => {
  const hash = crypt.makeHash('test')

  const equal = crypt.compare('test', hash)
  const notEqual = crypt.compare('test1', hash)

  t.equal(equal, true)
  t.equal(notEqual, false)
  t.end()
})
