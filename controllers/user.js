const User = require("../models/user")
const crypto = require("crypto")
const MongooseQueryBuilder = require("@exploitenomah/mongoose-query-builder")
const EmailSender = require("../services/email")

module.exports.sendVerificationEmail = async function(user) {
  if (!user) return null
  else {
    user.emailVerificationToken = crypto.randomBytes(48).toString("hex")
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
    } catch (err) {
      console.log(err)
    }
    return user
  }
}

module.exports.create = async function (data = {}, save = false) {
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
    expireAt,
    phone: {
      countryCode,
      number: phoneNumber
    }
  })
  if(save) return await newUser.save()
  return newUser
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
    phoneNumber, countryCode, longitude, latitude,firstName, lastName, dob, profileImage, about, origin, 
    gender, address, hasPets, pets, hasAllergies, allergies, budget, jobTitle, 
    organization, isStudent, school, major, tags, theme, userName,
    earliestMoveDate, targetLocation, lookingFor
  } = update
  return await User.findOneAndUpdate(filter, {
    firstName, lastName, dob,
    profileImage, about, gender, address, 
    hasPets, pets, hasAllergies, allergies, 
    budget, jobTitle, organization, isStudent, 
    school, major, tags, userName, 
    earliestMoveDate, lookingFor,
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
    ...(targetLocation?.longitude && targetLocation?.latitude ? 
    {
        targetLocation: {
        type: "Point",
        coordinates: [targetLocation.longitude, targetLocation.latitude]
      }
    } : {}),
    phone: {
      countryCode,
      number: phoneNumber
    },
    origin: {
      state: origin?.state,
      country: origin?.country
    }
  }, options)
}

module.exports.deleteOne = async function (filter = {}) {
  return await User.findOneAndDelete(filter)
}


