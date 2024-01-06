const Bookmark = require("../models/bookmark");
const MongooseQueryBuilder = require("@exploitenomah/mongoose-query-builder")

module.exports.createBookmark = async function (data = {}) {
  const { user, listing } = data
  let bookmark = new Bookmark({
     user, listing
  })
  return await bookmark.save()
}


module.exports.findManyBookmarks = async function (query = {}) {
  const bookmarkQuery = new MongooseQueryBuilder(Bookmark, query)
  return await bookmarkQuery.find()
}

module.exports.findOneBookmark = async function (filter = {}) {
  return await Bookmark.findOne(filter)
}

module.exports.deleteOneBookmark = async function (filter = {}) {
  return await Listing.findOneAndDelete(filter)
}