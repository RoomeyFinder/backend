const {
  create,
  findOne,
  findMany,
  updateOne,
  deleteOne,
} = require("../controllers/user")
const User = require("../models/user")
const cloudinary = require("../utils/cloudinary")
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
  const userId = req.params.id || req.user._id
  const user = await findOne({ _id: userId })
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
    profileImage,
  } = req.body
  if (Array.isArray(profileImage)) req.body.profileImage = profileImage[0]
  if (photosToKeep) {
    if (Array.isArray(photosToKeep))
      req.body.photosToKeep = photosToKeep.map((photo) => {
        if (typeof photo === "string") return JSON.parse(photo)
        return photo
      })
    if (typeof photosToKeep === "string")
      req.body.photosToKeep = [JSON.parse(photosToKeep)]
  }
  if (photosToDelete) {
    let done
    if (Array.isArray(photosToDelete)) {
      done = await Promise.all(
        photosToDelete.map(async (photo) => {
          if (typeof photo !== "string") return
          return await cloudinary.uploader.destroy(JSON.parse(photo).public_id)
        })
      )
    }
    if (typeof photosToDelete === "string")
      done = await cloudinary.uploader.destroy(
        JSON.parse(photosToDelete).public_id
      )
  }
  if (Array.isArray(req.body.lifestyleTags))
    req.body.lifestyleTags = req.body.lifestyleTags
      .filter((it) => Boolean(it))
      .map((t) => (typeof t === "string" ? JSON.parse(t) : t))
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

module.exports.toggleProfileVisiblity = routeTryCatcher(
  async (req, res, next) => {
    const user = await User.findOneAndUpdate(
      { _id: req.user._id },
      { isVisible: req.body.isVisible },
      { new: true }
    )
    res.status(200).json({
      user,
      statusCode: 200,
      message: `Profile successfully ${
        user.isVisible ? "activated" : "deactivated"
      }`,
    })
  }
)

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
  const users = await findMany({ ...req.query, _id: { $ne: req.user?._id } })
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
  if (req.body.newPassword || req.body.passwordResetCode) return next()
  const isValidPassword = await compareValueToHash(
    req.body.oldPassword,
    user.password
  )
  await user.generatePasswordResetCode()
  await user.sendPasswordResetEmail()
  await user.save()
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
  if (
    !req.body.newPassword ||
    req.body.newPassword?.length === 0 ||
    !req.body.passwordResetCode
  )
    return next()
  const user = await findOne({
    _id: req.user._id,
    passwordResetCode: req.body.passwordResetCode,
    passwordResetCodeExpiry: { $gte: new Date(Date.now()) },
  })
  if (!user) return next(new CustomError("Invalid Code!", 400))
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
