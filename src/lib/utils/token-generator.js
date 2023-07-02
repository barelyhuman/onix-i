import jwt from 'jsonwebtoken'
import { config } from '@/lib/config.mjs'

export default userDetails => {
  const payload = {
    id: userDetails.id,
  }

  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      Buffer.from(config.jwtSecret, 'base64'),
      { expiresIn: '1y' },
      (err, token) => {
        if (err) reject(err)
        return resolve(token)
      }
    )
  })
}
