const CustomError = require("./error")


module.exports.routeTryCatcher = function(asyncFn){
  return async function(req, res, next) {
    try{
      return await asyncFn(req, res, next)
    }catch(err){
      console.log(err)
      next(new CustomError(err.message, 500))
    }
  }
}

module.exports.sendResponse = function(req, res, next){
  res.status(req.response.statusCode || 500).json(req.response || { status: "error"})
}