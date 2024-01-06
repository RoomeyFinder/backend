const { createBookmark, findOneBookmark, findManyBookmarks, deleteOneBookmark } = require("../controllers/bookmark")
const { routeTryCatcher } = require("../utils/routes")

module.exports.createBookmark = routeTryCatcher(async function(req, res, next){
  let bookmark = await findOneBookmark({ owner: req.user._id.toString(), doc: req.body.doc })
  if(!bookmark) {
    bookmark = await createBookmark({
      owner: req.user._id,
      doc: req.body.doc,
      type: req.body.type 
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
  req.response = {
    statusCode: 200,
    bookmark: await findOneBookmark({ _id: req.params.id }),
    status: "success"
  }
  return next()
})

module.exports.getMultipleBookmarks = routeTryCatcher(async function (req, res, next) {
  req.response = {
    statusCode: 200,
    status: "success",
    bookmarks: await findManyBookmarks({
      ...req.query,
      owner: req.user._id
    }),
  }
  return next()
})

module.exports.deleteBookmark = routeTryCatcher(async function (req, res, next) {
  req.response = {
    statusCode: 200,
    bookmark: await deleteOneBookmark({ _id: req.params.id, owner: req.user._id.toString() }),
    status: "success"
  }
  return next()
})