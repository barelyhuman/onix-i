import { parse } from 'cookie'
import jwt from 'jsonwebtoken'
import { config } from '@/lib/config.mjs'

const decodeToken = async token => {
  const decoded = await jwt.verify(
    token,
    Buffer.from(config.jwtSecret, 'base64')
  )
  if (!decoded) return false
  return decoded
}

export const withLoginRedirect = function (redirTo, fn) {
  return async function (ctx) {
    var cookies, params, redirObj, req, res, token
    ;({ req, res, params } = ctx)
    cookies = parse(req.headers.cookie)
    token = cookies.auth
    redirObj = {
      redirect: {
        destination: `/login?redirect=/${redirTo}`,
        permanent: false,
      },
    }
    if (!(token && (ctx.user = await decodeToken(token)))) {
      return redirObj
    }
    return await fn(ctx)
  }
}

export const withAutoLogin = async function (ctx) {
  var cookies, err, props, req, res, token
  try {
    ;({ req, res } = ctx)
    cookies = parse(req.headers.cookie)
    token = cookies.auth
    props = {}
    if (!(token && (props.user = await decodeToken(token)))) {
      return {
        props: props,
      }
    }
    if (Object.keys(props.user).length > 0) {
      return {
        redirect: {
          destination: '/dashboard',
          permanent: false,
        },
        props: props,
      }
    } else {
      return {
        props: props,
      }
    }
  } catch (error) {
    err = error
    return {
      props: {},
    }
  }
}
