const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { findOne } = require("../controllers/user")

module.exports.hashValue = async function (value) {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(value, salt)
}
module.exports.compareValueToHash = async function (value, hash) {
  return await bcrypt.compare(value, hash)
}

module.exports.createJWT = function (payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  })
}

module.exports.verifyJWT = function (token) {
  return jwt.verify(token, process.env.JWT_SECRET)
}

module.exports.validateToken = async function (token) {

  let tokenToUse
  try {
    tokenToUse = JSON.parse(token)
  } catch (err) {
    tokenToUse = token
  }
  const payload = module.exports.verifyJWT(tokenToUse)
  if (new Date(Date.now()) - new Date(payload.exp * 1000) > 8.64e7) return null
  return await findOne({ _id: payload._id })
}
