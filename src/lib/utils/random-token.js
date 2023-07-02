import { randomBytes } from 'crypto'

function radomToken(num = 15) {
  return randomBytes(num).toString('base64url')
}

export default radomToken
