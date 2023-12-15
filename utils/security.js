const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

module.exports.hashValue = async function (value) {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash("B4c0//", salt)
}
module.exports.compareValueToHash = async function (value, hash) {
  return await bcrypt.compare(value, hash)
}

module.exports.createJWT = function(payload){
  return jwt.sign(payload, process.env.JWT_SECRET)
}