const { createFavorite, findOneFavorite, findManyFavorites, deleteOneFavorite } = require("../controllers/favorite")
const { routeTryCatcher } = require("../utils/routes")

module.exports.createFavorite = routeTryCatcher(async function(req, res, next){
  let favorite = await findOneFavorite({ owner: req.user._id.toString(), doc: req.body.doc })
  if(!favorite) {
    favorite = await createFavorite({
      owner: req.user._id,
      doc: req.body.doc,
      type: req.body.type 
    })
    await favorite.save()
  }
  req.response = {
    favorite,
    status: "success",
    statusCode: 201
  }
  return next()
})

module.exports.getFavorite = routeTryCatcher(async function (req, res, next) {
  req.response = {
    statusCode: 200,
    favorite: await findOneFavorite({ _id: req.params.id }),
    status: "success"
  }
  return next()
})

module.exports.getMultipleFavorites = routeTryCatcher(async function (req, res, next) {
  req.response = {
    statusCode: 200,
    status: "success",
    favorites: await findManyFavorites({
      ...req.query,
      owner: req.user._id
    }),
  }
  return next()
})

module.exports.deleteFavorite = routeTryCatcher(async function (req, res, next) {
  req.response = {
    statusCode: 200,
    favorite: await deleteOneFavorite({ _id: req.params.id, owner: req.user._id.toString() }),
    status: "success"
  }
  return next()
})