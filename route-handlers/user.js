const {
  create,
  findOne,
  findMany,
  updateOne,
  deleteOne,
} = require("../controllers/user")
const CustomError = require("../utils/error")
const { routeTryCatcher } = require("../utils/routes")
const { compareValueToHash, createJWT } = require("../utils/security")

module.exports.signup = routeTryCatcher(async function (req, res, next) {
  const existingUser = await findOne({ email: req.body.email })
  if (existingUser)
    return next(new CustomError("Email already in use! Try logging in!", 400))
  let user = await create(req.body, false)
  await user.save()
  user = await user.generateEmailVerificationCode(user)
  await user.sendVerificationEmail()
  await user.save()
  req.response = {
    user,
    status: "success",
    statusCode: 201,
  }
  return next()
})

module.exports.resendEmailVerificationCode = routeTryCatcher(async function (
  req,
  res,
  next
) {
  let user = await findOne({ email: req.body.email })
  if (!user) return next(new CustomError("Not allowed!", 403))
  user = await user.generateEmailVerificationCode(user)
  await user.sendVerificationEmail()
  user = await user.save()
  Object.keys(user).forEach((key) => {
    if (key !== "_id") user[key] = undefined
  })
  req.response = {
    user,
    status: "success",
    statusCode: 200,
    message: "A new verification code has been sent to your email",
  }
  return next()
})

module.exports.verifyEmail = routeTryCatcher(async function (req, res, next) {
  let user = await findOne({
    email: req.body.email,
    emailVerificationCode: req.params.emailVerificationCode,
  })
  if (!user) return next(new CustomError("Invalid code!", 403))
  if (new Date(Date.now()) > new Date(user.emailVerificationCodeExpiry))
    return next(new CustomError("Invalid code!", 403))
  user.isEmailVerified = true
  await user.save()
  req.response = {
    user,
    status: "success",
    statusCode: 200,
  }
  return next()
})

module.exports.login = routeTryCatcher(async function (req, res, next) {
  const { emailOrUserName, password } = req.body
  let user = await findOne({
    $or: [{ email: emailOrUserName }, { userName: emailOrUserName }],
  })
  if (!user) return next(new CustomError("Invalid credentials!", 400))
  const isMatchingPassword = await compareValueToHash(password, user.password)
  if (isMatchingPassword === false)
    return next(new CustomError("Invalid credentials", 400))
  if (!user.isEmailVerified) {
    user = await user.generateEmailVerificationCode()
    await user.sendVerificationEmail(user)
    await user.save()
    return next(
      new CustomError(
        `Please verify your email. A link has been sent to your email address ${user.email}`,
        302
      )
    )
  }
  const token = createJWT({ _id: user._id })
  await user.updateLastSeen()
  delete user.password
  req.response = {
    statusCode: 200,
    user,
    token,
    status: "success",
  }
  return next()
})

module.exports.getUser = routeTryCatcher(async function (req, res, next) {
  const user = await findOne({ _id: req.params.id })
  await user.updateLastSeen()
  delete user.password
  req.response = {
    statusCode: 200,
    user,
    status: "success",
  }
  return next()
})

module.exports.updateUser = routeTryCatcher(async function (req, res, next) {
  if (req.params.id !== req.user._id.toString())
    return next(new CustomError("Not allowed!", 403))
  const {
    hasPets,
    pets,
    hasAllergies,
    allergies,
    photosToDelete,
    photosToKeep,
    newPhotos,
  } = req.body
  console.log(req.body.lifestyleTags, "dfadfaa")
  if (Array.isArray(req.body.lifestyleTags))
    req.body.lifestyleTags = req.body.lifestyleTags
      .filter((it) => Boolean(it))
      .map((t) => typeof t === "string" ? JSON.parse(t) : t)
  const petsError =
    ((hasPets === true && pets?.length === 0) ||
      (hasPets === false && pets?.length > 0)) &&
    "Please specify pet(s)"
  const allergiesError =
    ((hasAllergies === true && allergies?.length === 0) ||
      (hasAllergies === false && allergies?.length > 0)) &&
    "Please specify allergies"
  if (allergiesError || petsError)
    return next(
      new CustomError(`${allergiesError || ""}\n ${petsError || ""}`, 400)
    )
  const user = await updateOne({ _id: req.user._id }, req.body)
  await user.updateLastSeen()
  req.response = {
    user: user,
    statusCode: 200,
    status: "success",
  }
  return next()
})

module.exports.completeSignup = routeTryCatcher(async function (
  req,
  res,
  next
) {
  let user = await findOne({ email: req.body.email })
  if (!user) return next(new CustomError("Not allowed!", 403))
  if (req.params.emailVerificationCode !== user.emailVerificationCode)
    return next(new CustomError("Not allowed!", 403))
  const { currentAddress, currentLongitude, currentLatitude, zipcode } =
    req.body
  user = await updateOne(
    { _id: user._id },
    { currentLongitude, currentLatitude, currentAddress, zipcode }
  )
  user.emailVerificationCode = undefined
  await user.updateLastSeen()
  await user.save()
  const token = createJWT({ _id: user._id })
  delete user.password
  req.response = {
    user: user,
    token,
    statusCode: 200,
    status: "success",
  }
  return next()
})

module.exports.getMultipleUsers = routeTryCatcher(async function (
  req,
  res,
  next
) {
  const users = await findMany(req.query)
  req.response = {
    statusCode: 200,
    users,
    status: "success",
  }
  return next()
})

module.exports.validatePassword = routeTryCatcher(async function (
  req,
  res,
  next
) {
  const user = await findOne({ _id: req.user._id })
  if (!user) return next(new CustomError("Invalid request!", 400))
  const isValidPassword = await compareValueToHash(
    req.body.oldPassword,
    user.password
  )
  req.response = {
    isValidPassword,
    statusCode: 200,
    status: "success",
  }
  return next()
})

module.exports.changePassword = routeTryCatcher(async function (
  req,
  res,
  next
) {
  if (!req.body.newPassword || req.body.newPassword?.length === 0) return next()
  const { isValidPassword } = req.response
  if (!isValidPassword)
    return next(new CustomError("Old password not matched", 400))
  const user = await findOne({ _id: req.user._id })
  if (!user) return next(new CustomError("Invalid request!", 400))
  user.password = req.body.newPassword
  await user.save()
  req.response = {
    statusCode: 200,
    status: "success",
    message: "Password changed successfully",
  }
  next()
})
module.exports.deleteAccount = routeTryCatcher(async function (req, res, next) {
  if (req.user._id.toString() !== req.params.id)
    return next("Not allowed!", 403)
  const user = await deleteOne({ _id: req.user._id.toString() })
  req.response = {
    statusCode: 200,
    user,
    status: "success",
  }
  return next()
})
