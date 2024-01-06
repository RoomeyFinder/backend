const { createBookmark, findOneBookmark, findManyBookmarks, deleteOneBookmark } = require("../controllers/bookmark")
const CustomError = require("../utils/error")
const { routeTryCatcher } = require("../utils/routes")

module.exports.createBookmark = routeTryCatcher(async function(req, res, next){
  let bookmark = await findOneBookmark({ user: req.user._id.toString(), listing: req.listing })
  if(!bookmark) {
    bookmark = await createBookmark({
      user: req.user._id,
      listing: req.body.listing 
    })
    await bookmark.save()
  }
  req.response = {
    bookmark,
    status: "success",
    statusCode: 201
  }
  return next()
})

module.exports.getBookmark = routeTryCatcher(async function (req, res, next) {
  const bookmark = await findOneBookmark({ _id: req.params.id })
  req.response = {
    statusCode: 200,
    bookmark,
    status: "success"
  }
  return next()
})

module.exports.getMultipleBookmarks = routeTryCatcher(async function (req, res, next) {
  const bookmarks = await findManyBookmarks({
    ...req.query,
    user: req.user._id
  })
  req.response = {
    statusCode: 200,
    bookmarks,
    status: "success"
  }
  return next()
})
module.exports.deleteBookmark = routeTryCatcher(async function (req, res, next) {
  const listing = await deleteOneBookmark({ _id: req.params.id, user: req.user._id.toString() })
  req.response = {
    statusCode: 200,
    listing,
    status: "success"
  }
  return next()
})