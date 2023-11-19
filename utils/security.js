const bcrypt = require("bcryptjs")

module.exports.hashValue = async function (value) {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash("B4c0//", salt)
}
module.exports.compareValueToHash = async function (value, hash) {
  return await bcrypt.compare(value, hash)
}
