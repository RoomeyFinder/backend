const User = require("../models/user")
const MongooseQueryBuilder = require("@exploitenomah/mongoose-query-builder")
const { formatLocation, concatToArrayUntilMax } = require("../utils")

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
  console.log(update, user)
  const {  
    currentLongitude, currentLatitude, lifestyleTags = [], targetLongitude, targetLatitude, newPhotos = [], photosToKeep = [],
  } = update
  if(currentLongitude && currentLatitude)
    user.currentLocation = formatLocation(currentLongitude, currentLatitude)
  if(targetLongitude && targetLatitude)
    user.targetLocation = formatLocation(targetLongitude, targetLatitude)
  if(Array.isArray(newPhotos)){
    if(Array.isArray(photosToKeep)) user.photos = photosToKeep
    user.photos = concatToArrayUntilMax(10, user.photos, newPhotos)
  }
  if(Array.isArray(lifestyleTags))
    user.lifestyleTags = lifestyleTags
  let saved= await user.save()
  console.log(user.lifestyleTags)
  return saved
}

module.exports.deleteOne = async function (filter = {}) {
  return await User.findOneAndDelete(filter)
}


