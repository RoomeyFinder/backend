const { handleValidationError, handleTypeError, handleCastError, handleDuplicateKeyError } = require("../utils/errorFormatters")
const sendDevErrorResponse = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
    statusCode: err.statusCode,
  })
}
const sendProductionErrorResponse = (err, res) => {
  console.error(err)
  err.isOperational
    ? res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      statusCode: err.statusCode,
    })
    : res.status(500).json({
      status: "failed",
      message: "Something went wrong!",
      statusCode: 500,
    })
}

module.exports = (err, req, res, next) => {
  err.status = err.status || "error"
  err.statusCode = err.statusCode || 500
  if (process.env.NODE_ENV !== "prod") {
    sendDevErrorResponse(err, res)
  } else {
    let error = err
    if (err.name === "ValidationError") error = handleValidationError(err)
    if (err.code === 11000) error = handleDuplicateKeyError(err)
    if (err.name === "CastError") error = handleCastError(err)
    if (err.name === "TypeError") error = handleTypeError(err)
    sendProductionErrorResponse(error, res)
  }
}
