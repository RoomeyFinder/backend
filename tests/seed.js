const User = require("../models/user")
const { signupUser } = require("./auth.utils")
const usersJson = require("./seeds/users.json")

module.exports.seedUsers = async function(count = 5){
  let seedUsers = usersJson
  if (count < seedUsers.length) seedUsers = seedUsers.filter((it, idx) => idx < count)
  const users = await Promise.all(seedUsers.map(async it => { 
    return (await signupUser(it)).body.user
  }))
  return users
}
