import { config } from '@/lib/config.mjs'
import isDev from './is-dev'
import { join } from 'path'

const fs = require('fs')
const template = require('lodash.template')
const nodemailer = require('nodemailer')

let transporter
let transportConfig

const getTransporterConfig = () =>
  JSON.parse(Buffer.from(config.mailer, 'base64').toString())

const createMailerInstance = () => {
  transportConfig = getTransporterConfig()

  if (transporter) return transporter

  transporter = nodemailer.createTransport({
    host: transportConfig.host,
    port: transportConfig.port,
    secure: transportConfig.secure,
    auth: {
      user: transportConfig.username,
      pass: transportConfig.password,
    },
  })

  return transporter
}

const app = {}

app.sendLoginVerification = async (toEmail, verificationLink, token_id) => {
  const loginTemplate = fs.readFileSync('src/lib/email-templates/login.html')
  const compiledTemplate = template(loginTemplate)

  if (isDev()) {
    // eslint-disable-next-line no-console
    console.log({ verificationLink })
    return
  }

  createMailerInstance().sendMail(
    {
      from: `${transportConfig.fromEmailName}<${transportConfig.fromEmail}>`,
      to: toEmail,
      subject: `Login Verification (token: ${token_id})`,
      html: compiledTemplate({
        verificationLink,
      }),
    },
    err => {
      if (err) throw new Error(err)
    }
  )
}

export default app
