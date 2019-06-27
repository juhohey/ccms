const { merge } = require('ramda')
const { makeHash } = require('../../auth/bcrypt')
const { getId } = require('../../../utils/id')
const user = {
  id: String,
  email: String,
  password: String,
  frozen: Boolean,
  role: String
}
module.exports = {
  user,
  makeUser: ({ email, password, role }) => merge(user, { email, password: password ? makeHash(password) : null, role, id: getId() })
}
