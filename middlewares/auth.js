const CustomError = require("../utils/error");
const { routeTryCatcher } = require("../utils/routes");
const { validateToken } = require("../utils/security");


module.exports.protectRoute = routeTryCatcher(async function(req, res, next){
  let token
  const tokenHeader = req.headers["authorization"] || req.headers["Authorization"]
  if (!tokenHeader) token = req.headers.access_token
  else token = tokenHeader.split("Bearer ")[1]
  if(!token) return next(new CustomError("Unauthorized!", 403))
  const user = await validateToken(token)
  if(!user) return next(new CustomError("Unauthorized", 403))
  req.user = user
  next()
})