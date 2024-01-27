const User = require("../models/user")
const MongooseQueryBuilder = require("@exploitenomah/mongoose-query-builder")
const EmailSender = require("../services/email")
const { formatLocation, concatToArrayUntilMax, generateRandomSixDigitToken } = require("../utils")

module.exports.sendVerificationEmail = async function(user) {
  if (!user) return null
  else {
    const expiry = new Date(Date.now())
    expiry.setHours(expiry.getHours() + 48)
    user.emailVerificationCode = generateRandomSixDigitToken()
    user.emailVerificationCodeExpiry = expiry
    const msg = {
      from: process.env.APP_EMAIL_ADDRESS,
      to: user.email,
      subject: "Please verify your email",
    }
    const options = {
      emailVerificationCode: `${user.emailVerificationCode}`,
      user,
      clientUrl: process.env.CLIENT_URL,
    }
    try {
      await new EmailSender({
        msg, template: "verifyEmail", options
      }).sendEmail()
    } catch (err) {
      process.env.NODE_ENV !== "test" && console.log(err)
    }
    return user
  }
}

module.exports.create = async function (data = {}, save = false) {
  const { 
    firstName, lastName, email, password, 
    dob, gender, countryCode, phoneNumber, occupation, isStudent, school
   } = data
  const expireAt = new Date(Date.now())
  expireAt.setMonth(expireAt.getMonth() + 1)
  let newUser = new User({
    firstName, lastName, email, password, 
    dob, gender, phoneNumber, countryCode,
    expireAt, occupation, isStudent, school
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

module.exports.updateOne = async function (filter = {}, update = {}) {
  const user = await User.findOne(filter)
  if(!user) return user
  const allowedPaths = [
    "firstName",
    "lastName",
    "dob",
    "about",
    "gender",
    "hasPets",
    "pets",
    "hasAllergies",
    "budget",
    "jobTitle",
    "organization",
    "isStudent",
    "school",
    "major",
    "theme",
    "userName",
    "earliestMoveDate",
    "lookingFor",
    "targetCity", 
    "targetState",
    "currentAddress", 
    "stateOfOrigin",
    "countryOfOrigin",
    "countryCode",
    "phoneNumber",
    "zipcode"
  ]
  Object.keys(update).forEach(key => {
    if (allowedPaths.includes(key) && update[key] !== undefined) 
      user[key] = update[key]
  })
  const {  
    currentLongitude, currentLatitude, tags, targetLongitude, targetLatitude, photos
  } = update
  if(currentLongitude && currentLatitude)
    user.currentLocation = formatLocation(currentLongitude, currentLatitude)
  if(targetLongitude && targetLatitude)
    user.targetLocation = formatLocation(targetLongitude, targetLatitude)
  if(Array.isArray(photos))
    user.photos = concatToArrayUntilMax(10, user.photos, photos)
  if(Array.isArray(tags))
    user.tags = concatToArrayUntilMax(20, user.tags, tags)

  return await user.save()
}

module.exports.deleteOne = async function (filter = {}) {
  return await User.findOneAndDelete(filter)
}


