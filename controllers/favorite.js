const Favorite = require("../models/favorite");
const MongooseQueryBuilder = require("@exploitenomah/mongoose-query-builder")

module.exports.createFavorite = async function (data = {}) {
  const { owner, doc, type } = data
  let favorite = new Favorite({
     owner, doc, type
  })
  return await favorite.save()
}

module.exports.findManyFavorites = async function (query = {}) {
  const favoriteQuery = new MongooseQueryBuilder(Favorite, query)
  return await favoriteQuery.find()
}

module.exports.findOneFavorite = async function (filter = {}) {
  return await Favorite.findOne(filter)
}

module.exports.deleteOneFavorite = async function (filter = {}) {
  return await Favorite.findOneAndDelete(filter)
}