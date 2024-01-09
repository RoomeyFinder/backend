const { create, sendVerificationEmail, findOne, findMany, updateOne, deleteOne } = require("../controllers/user")
const CustomError = require("../utils/error")
const { routeTryCatcher } = require("../utils/routes")
const { compareValueToHash, createJWT } = require("../utils/security")

module.exports.signup = routeTryCatcher(async function(req, res, next){
  const existingUser = await findOne({ email: req.body.email })
  if(existingUser) return next(new CustomError("Email already in use! Try logging in!", 400))
  let user = await create(req.body, false)
  user = await sendVerificationEmail(user)
  await user.save()
  req.response = {
    user,
    status: "success",
    statusCode: 201
  }
  return next()
})

module.exports.verifyEmail = routeTryCatcher(async function (req, res, next) {
  let user = await findOne({ _id: req.params.id, emailVerificationToken: req.params.emailVerificationToken })
  if (!user) return next(new CustomError("Not allowed!", 403))
  user.emailVerificationToken = undefined
  user.isEmailVerified = true
  await user.save()
  req.response = {
    user,
    status: "success",
    statusCode: 200
  }
  return next()
})

module.exports.login = routeTryCatcher(async function(req, res, next){
  const { emailOrUserName, password } = req.body
  const user = await findOne({ $or: [{ email: emailOrUserName }, { userName: emailOrUserName }]})
  if(!user) return next(new CustomError("Invalid credentials!", 400))
  const isMatchingPassword = await compareValueToHash(password, user.password)
  if (isMatchingPassword === false) return next(new CustomError("Invalid credentials", 400))
  if(!user.isEmailVerified){
    await sendVerificationEmail(user)
    await user.save()
    return next(new CustomError(`Please verify your email. A link has been sent to your email address ${user.email}`, 400))
  }
  const token = createJWT({ _id: user._id })
  delete user.password
  req.response = {
    statusCode: 200,
    user,
    token,
    status: "success"
  }
  return next()
})

module.exports.getUser = routeTryCatcher(async function (req, res, next) {
  const user = await findOne({ _id: req.params.id })
  delete user.password
  req.response = {
    statusCode: 200,
    user,
    status: "success"
  }
  return next()
})

module.exports.updateUser = routeTryCatcher(async function(req, res, next){
  if(req.params.id !== req.user._id.toString()) return next(new CustomError("Not allowed!", 403))
  const {
    hasPets, pets, hasAllergies, allergies, userName,
  } = req.body
  const existingUserWithUserName = await findOne({ userName })
  if(existingUserWithUserName) return next(new CustomError("Username is already taken!", 400))
  const petsError =
    ((hasPets === true && pets.length === 0 ) ||
    (hasPets === false && pets.length > 0)) && "Please specify pet(s)"
  const allergiesError =
    ((
      hasAllergies === true && allergies.length === 0) ||
      hasAllergies === false && allergies.length > 0) && "Please specify allergies"
  if (allergiesError || petsError)
    return next(new CustomError(`${allergiesError || ""}\n ${petsError || ""}`, 400))
  const user = await updateOne({ _id: req.user._id }, req.body)
  req.response = {
    user: user,
    statusCode: 200,
    status: "success"
  }
  return next()
})

module.exports.getMultipleUsers = routeTryCatcher(async function (req, res, next) {
  const users = await findMany(req.query)
  req.response = {
    statusCode: 200,
    users,
    status: "success"
  }
  return next()
})
module.exports.deleteAccount = routeTryCatcher(async function (req, res, next) {
  if(req.user._id.toString() !== req.params.id) return next("Not allowed!", 403)
  const user = await deleteOne({ _id: req.user._id.toString() })
  req.response = {
    statusCode: 200,
    user,
    status: "success"
  }
  return next()
})