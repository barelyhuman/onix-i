import process from 'process'
import Yup from 'yup'
import { config as loadEnv } from 'dotenv'

loadEnv()

const envValidator = Yup.object().shape({
  jwtSecret: Yup.string().required(),
  mailer: Yup.string().required(),
  originUrl: Yup.string().required(),
})

const originUrls = {
  development: process.env.ORIGIN_URL || 'http://localhost:3000',
  production: process.env.ORIGIN_URL || 'https://tillwhen.barelyhuman.dev',
}

export const config = envValidator.validateSync({
  jwtSecret: process.env.JWT_SECRET,
  mailer: process.env.MAILER,
  originUrl: originUrls[process.env.NODE_ENV || 'development'],
})
