const { createInterest, findOneInterest, findManyInterests, deleteOneInterest } = require("../controllers/interest")
const Interest = require("../models/interest")
const CustomError = require("../utils/error")
const { routeTryCatcher } = require("../utils/routes")

module.exports.createInterest = routeTryCatcher(async function (req, res, next) {
  let interest = await findOneInterest({ sender: req.user._id.toString(), doc: req.body.doc })
  if (!interest) {
    interest = await createInterest({
      sender: req.user._id,
      doc: req.body.doc,
      type: req.body.type,
    })
    await interest.save()
  }
  req.response = {
    interest,
    status: "success",
    statusCode: 201
  }
  return next()
})

module.exports.getInterest = routeTryCatcher(async function (req, res, next) {
  req.response = {
    statusCode: 200,
    interest: await findOneInterest({ _id: req.params.id, $or: [{ sender: req.user._id }, { doc: req.user._id}] }),
    status: "success"
  }
  return next()
})

module.exports.getMultipleInterests = routeTryCatcher(async function (req, res, next) {
  req.response = {
    statusCode: 200,
    status: "success",
    interests: await findManyInterests({
      ...req.query,
      $or: [{ sender: req.user._id }, { doc: req.user._id }]
    }),
  }
  return next()
})

module.exports.updateInterest = routeTryCatcher(async function(req, res, next) {
  const interest = await findOneInterest({ _id: req.params.id, doc: req.user._id })
  if(!interest) return next(new CustomError("Not allowed!", 403))
  if(interest.seen === false){
    interest.seen = true
    await interest.save()
  }
  return {
    interest,
    statusCode: 200,
    status: "success",
  }
})

module.exports.deleteInterest = routeTryCatcher(async function (req, res, next) {
  const interest = await findOneInterest({ _id: req.params.id, $or: [{ sender: req.user._id }, { doc: req.user._id}] })
  if(!interest){
    req.response = {
      statusCode: 403,
      interest: null,
      status: "error"
    }
    return next()
  }
  await Interest.findOneAndDelete({ _id: req.params.id, $or: [{ sender: req.user._id }, { doc: req.user._id }]})
  req.response = {
    statusCode: 200,
    interest,
    status: "success"
  }
  return next()
})