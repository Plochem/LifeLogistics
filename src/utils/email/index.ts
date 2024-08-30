import { google } from 'googleapis'
import nodemailer from 'nodemailer'

const oAuth2Client = new google.auth.OAuth2(
  process.env.MAIL_CLIENT_ID || '',
  process.env.MAIL_CLIENT_SECRET || '',
  'https://developers.google.com/oauthplayground'
)

oAuth2Client.setCredentials({
  refresh_token: process.env.MAIL_REFRESH_TOKEN || '',
})

export const sendMail = async ({
  to,
  subject,
  message,
}: {
  to: string[]
  subject: string
  message: string
}) => {
  const accessToken = await oAuth2Client.getAccessToken()

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      type: 'OAuth2',
      user: 'lifelogistics9@gmail.com',
      clientId: process.env.MAIL_CLIENT_ID || '',
      clientSecret: process.env.MAIL_CLIENT_SECRET || '',
      refreshToken: process.env.MAIL_REFRESH_TOKEN || '',
      accessToken: accessToken as string,
    },
  })

  const res = await transporter.sendMail({
    to: to.join(', '),
    subject,
    text: message,
  })

  return res
}

export const generateVerificationCode = () => ({
  code: Math.random().toString(36).substring(2, 10),
  exp: new Date(new Date().getTime() + 1 * 60 * 1000),
})
