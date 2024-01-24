const nodemailer = require("nodemailer")
const { google } = require("googleapis")
const path = require("path")
const pug = require("pug")
const dotenv = require("dotenv")
const Email = require("email-templates")
const { convert } = require("html-to-text")
dotenv.config({
  path: "./.env",
})

const isDev = process.env.NODE_ENV === "DEV"
const isTest = process.env.NODE_ENV === "test"
const OAuth2 = google.auth.OAuth2
const oauth2Client = new OAuth2(
  process.env.OAUTH_CLIENTID,
  process.env.OAUTH_CLIENT_SECRET,
  process.env.REDIRECT_URL
)
oauth2Client.setCredentials({
  refresh_token: process.env.OAUTH_REFRESH_TOKEN,
})

const accessToken = async () =>
  await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        reject(err)
      }
      resolve(token)
    })
  })

let transporter
if (process.env.NODE_ENV === "dev" && !isTest) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST_DEV,
    port: process.env.EMAIL_PORT_DEV,
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME_DEV,
      pass: process.env.EMAIL_PASSWORD_DEV,
    },
    tls: {
      rejectUnauthorized: false,
    },
  })
} else {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL_USERNAME_PROD,
      pass: process.env.EMAIL_PASSWORD_PROD,
      clientId: process.env.OAUTH_CLIENTID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN,
      accessToken,
    },
    lessSecureApp: true,
    tls: {
      rejectUnauthorized: false,
    },
  })
}

/*
 * Class to send Emails
 **/
class EmailSender {
  /**
   * Create an Email Sender.
   * @param {msg} msg - {
			from: 'sender@example.com',
			to: 'recipient@example.com',
			subject: 'Message',
     }.
   * @param {template} template - The file name holding the template for email to be sent.
   * @param {options} options - pug.Options & pug.LocalsObject
  */
  constructor({ msg, template, options }) {
    this.msg = { ...msg, from: msg.from || process.env.EMAIL_USERNAME_PROD }
    this.template = template
    this.options = options
  }

  generateTxtAndHTML() {
    this.html = pug.renderFile(
      path.join(`${__dirname}`, "../views", "emails", `${this.template}.pug`),
      this.options
    )
    this.text = convert(this.html)
    this.msg = {
      ...this.msg,
      html: this.html,
      text: this.text,
    }
    return this
  }

  async sendEmail() {
    if(isTest) return 
    if (isDev) {
      const email = new Email({
        views: { root: path.join("views", "emails") },
        preview: isDev,
      })
      email.send({
        message: {
          ...this.msg,
          html: await email.render(this.template, this.options),
        },
      })
      .then(() => { }).catch((err) => { })
    } else if(!isDev && !isTest) {
      this.generateTxtAndHTML()
      return new Promise((resolve, reject) => {
        transporter.sendMail(this.msg, (err, info) => {
          if (err) {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject({
              response: "failed",
              error: err,
            })
          } else {
            resolve({
              response: "success",
              envelope: info,
            })
          }
          transporter.close()
        })
      })
    }
  }
}

module.exports = EmailSender
