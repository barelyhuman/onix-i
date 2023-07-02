import { db } from '@/lib/db'
import { validateJWT } from '@/lib/utils/jwt-validator'
import runMiddleware from '@/lib/utils/run-middleware'
import createRateLimiter from 'express-rate-limit'
import isDev from '@/lib/utils/is-dev'

const limiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  standardHeaders: true,
  keyGenerator: (req, res) => {
    if (isDev()) return 'hello'
    return req.ip
  },
})

export async function initialRequestHandler({ req, res, auth = false }) {
  await runMiddleware(req, res, limiter)
  req.db = db
  if (auth) {
    const decoded = await validateJWT(req, res)
    req.currentUser = decoded
  }
  return true
}
