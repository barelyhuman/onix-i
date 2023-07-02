const bcrypt = require('bcrypt')

module.exports = {
  hash(stringPassword) {
    const salt = bcrypt.genSaltSync()
    return bcrypt.hashSync(stringPassword, salt)
  },
  compare(stringPassword, hashedPassword) {
    return bcrypt.compareSync(stringPassword, hashedPassword)
  },
}
