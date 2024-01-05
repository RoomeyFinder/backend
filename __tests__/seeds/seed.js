const User = require("../../models/user")
const { signupUser } = require("../utils/auth.utils")
const usersJson = require("./users.json")
const listingsJson = require("./listings.json")

module.exports.seedUsers = async function (server, count = 5) {
  let seedUsers = usersJson
  if (count < seedUsers.length) seedUsers = seedUsers.filter((_, idx) => idx < count)
  const users = await Promise.all(seedUsers.map(async it => {
    return await signupUser(server)(it)
  }))
  return users
}


module.exports.seedListings = async function (server, count) {
  return async function (userId, photos) {

  }
}
