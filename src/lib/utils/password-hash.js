const bcrypt = require('bcrypt')

export default {
  hash(stringPassword) {
    const salt = bcrypt.genSaltSync()
    return bcrypt.hashSync(stringPassword, salt)
  },
  compare(stringPassword, hashedPassword) {
    return bcrypt.compareSync(stringPassword, hashedPassword)
  },
};
