import { randomBytes } from 'crypto'

export function randomToken(num = 15) {
  return randomBytes(num).toString('base64url')
}
