const CustomError = require("./error")

module.exports.handleDuplicateKeyError = (err) => {
  const key = Object.keys(err.keyValue)[0]
  const message = `Duplicate error: The ${key} is already taken. Try another ${key}`
  return new CustomError(message, 400)
}
module.exports.handleCastError = (err) => {
  const invalid = err.path
  const message = `Invalid value for ${invalid}`
  return new CustomError(message, 400)
}
module.exports.handleTypeError = () => {
  const message = "Something went wrong!"
  return new CustomError(message, 500)
}
module.exports.handleValidationError = (err) => {
  const message = Object.values(err.errors)
    .map((val) => val.message)
    .join(", ")
  return new CustomError(message, 400)
}
