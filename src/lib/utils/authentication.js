import { config } from '@/lib/config.mjs'
import jwt from 'jsonwebtoken'

export async function isAuthenticated(authToken) {
  const decoded = await jwt.verify(
    authToken,
    Buffer.from(config.jwtSecret, 'base64')
  )
  if (!decoded) return false
  return decoded
}
