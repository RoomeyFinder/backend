const path = require("path")
const Mailgen = require("mailgen")
const nodemailer = require("nodemailer")
const dotenv = require("dotenv")
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
})
const MailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "RoomeyFinder",
    link: "https://mailgen.js/",
  },
})

const transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USERNAME,
    pass: process.env.MAILTRAP_PASSWORD,
  },
})

module.exports.sendPasswordResetEmail = async function (
  data = { email, passwordResetCode }
) {
  const emailData = {
    body: {
      name: "",
      intro: "Password reset code",
      action: {
        instructions: "Please use the code provided to reset your password",
        button: {
          text: data.passwordResetCode,
        },
      },
      outro: "Please ignore this email if you didn't request a password reset.",
    },
  }
  const emailBody = MailGenerator.generate(emailData)
  const mailOptions = {
    from: process.env.EMAIL,
    to: data.email,
    subject: "Password reset code",
    html: emailBody,
  }
  const sent = await transporter.sendMail(mailOptions)
  if (sent.accepted[0] === data.email) return true
  else return false
}

module.exports.EmailSender = class  {
  constructor() {}
  static generateEmailBody({
    name = "",
    intro = "",
    action = {
      instructions: "",
      button: {
        text: "",
      },
    },
    outro = "",
  }) {
    return MailGenerator.generate({
      body: {
        name,
        intro,
        action,
        outro,
      },
    })
  }
  static async sendEmail(
    mailOptions = {
      from: process.env.EMAIL,
      to: "",
      subject: "",
      html,
    }
  ) {
    const sent = await transporter.sendMail(mailOptions)
    if (sent.accepted[0] === mailOptions.to) return true
    else return false
  }
}
