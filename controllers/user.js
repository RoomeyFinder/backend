const User = require("../models/user")
const crypto = require("crypto")
const MongooseQueryBuilder = require("@exploitenomah/mongoose-query-builder")
const EmailSender = require("../services/email")

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
  const { 
    firstName, lastName, email, password, 
    dob, gender, longitude, latitude, 
    countryCode, phoneNumber
   } = data
  const expireAt = new Date(Date.now())
  expireAt.setMonth(expireAt.getMonth() + 1)
  let newUser = new User({
    firstName, lastName, email, password, 
    dob, gender, countryCode, phoneNumber,
    currentLocation: {
      type: "Point",
      coordinates: [longitude, latitude]
    },
    emailVerificationToken: crypto.randomBytes(48).toString("hex"),
    expireAt,
    phone: {
      countryCode,
      number: phoneNumber
    }
  })
  newUser = await sendVerificationEmail(newUser)
  if(newUser) return await newUser.save()
  else return null
}


module.exports.findMany = async function (query = {}) {
  const usersQuery = new MongooseQueryBuilder(User, query)
  return await usersQuery.find()
}

module.exports.findOne = async function (filter = {}) {
  return await User.findOne(filter)
}

module.exports.updateOne = async function (filter = {}, update = {}, options = { new: true }) {
  const { 
    phoneNumber, countryCode, longitude, latitude,firstName, lastName, dob,
    currentSubscription, isIdVerified, isEmailVerified, isPhoneNumberVerified, 
    emailVerificationToken, profileImage, passwordResetToken, about, origin, 
    gender, address, hasPets, pets, hasAllergies, allergies, budget, jobTitle, 
    organization, isStudent, school, major, tags, theme 
  } = update
  return await User.findOneAndUpdate(filter, {
    firstName, lastName, dob,
    currentSubscription, isIdVerified, isEmailVerified, isPhoneNumberVerified, 
    emailVerificationToken, profileImage, passwordResetToken, about, origin, 
    gender, address, hasPets, pets, hasAllergies, allergies, budget, jobTitle, 
    organization, isStudent, school, major, tags,
    uiPreferences: {
      theme,
    }, 
    ...(longitude && latitude ? 
    {
      currentLocation: {
        type: "Point",
        coordinates: [longitude, latitude]
      }
    } : {}),
    phone: {
      countryCode,
      number: phoneNumber
    }
  }, options )
}

module.exports.deleteOne = async function (filter = {}) {
  return await User.findOneAndDelete(filter)
}


