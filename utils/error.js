
module.exports = class CustomError extends Error {
	constructor (message, statusCode) {
		super(message)
		this.message = message
		this.statusCode = statusCode || 500
		this.status = statusCode.toString().startsWith('4') ? 'failed' : 'error'
		this.isOperational = true
		Error.captureStackTrace(this, this.constructor)
	}
}
