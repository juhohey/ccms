const bcrypt = require('bcrypt')

module.exports = {
  compare: (presumed, pass) => bcrypt.compareSync(presumed, pass),
  makeHash: (pass) => {
    const salt = bcrypt.genSaltSync() // default 10 rounds
    const encrypted = bcrypt.hashSync(pass, salt)
    return encrypted
  }
}
