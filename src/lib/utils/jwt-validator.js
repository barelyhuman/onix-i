import { config } from '@/lib/config.mjs'
import jwt from 'jsonwebtoken'
import { Response } from '@/lib/utils/response'

export const validateJWT = async (req, res) => {
  const token =
    req.headers.Authorization || req.headers.authorization || req.cookies.auth

  if (!token || !token.length) return Response(401, 'Unauthorized!', res)

  try {
    const decoded = await jwt.verify(
      token,
      Buffer.from(config.jwtSecret, 'base64')
    )

    if (!decoded) return Response(401, 'Unauthorized!', res)

    const userDetails = await req.db('users').where({
      id: decoded.id,
    })

    if (!userDetails.length) return Response(401, 'Unauthorized!', res)

    return decoded
  } catch (err) {
    console.error(err)
    return Response(401, 'Unauthorized!', res)
  }
}
