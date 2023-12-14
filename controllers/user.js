const User = require("../models/user")
const crypto = require("crypto")


async function sendVerificationEmail(user) {
  if (!user) return null
  else {
    const msg = {
      from: process.env.APP_EMAIL_ADDRESS,
      to: user.email,
      subject: "Please verify your email",
    }
    const options = {
      emailVerificationLink: `${process.env.CLIENT_URL}/verify-email/${user._id}/${user.emailVerificationToken}`,
      clientUrl: process.env.CLIENT_URL,
    }
    try {
      await new EmailSender({
        msg, template: "verifyEmail", options
      }).sendEmail()
      return user
    } catch (err) {
      console.log(err)
      return null
    }
  }
}

module.exports.create = async function (data = {}) {
  const { firstName, lastName, email, password, dob, gender, phone, longitude, latitude } = data
  const expireAt = new Date(Date.now())
  expireAt.setMonth(expireAt.getMonth() + 1)
  let newUser = new User({
    firstName, lastName, email, password, dob, gender, phone,
    currentLocation: {
      type: "Point",
      coordinates: [longitude, latitude]
    },
    emailVerificationToken: crypto.randomBytes(48).toString("hex"),
    expireAt,
  })
  newUser = await sendVerificationEmail(newUser)
  if(newUser) return await newUser.save()
  else return null
}
