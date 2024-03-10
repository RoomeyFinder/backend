const {
  create,
  findOne,
  findMany,
  updateOne,
  deleteOne,
} = require("../controllers/listing")
const CustomError = require("../utils/error")
const Listing = require("../models/listing")
const { routeTryCatcher } = require("../utils/routes")

module.exports.createListing = routeTryCatcher(async function (req, res, next) {
  if (!Array.isArray(req.body.photos)) delete req.body.photos
  if (!Array.isArray(req.body.features)) req.body.features = []
  req.body.features = req.body.features
    .filter((it) => it)
    .map((it) => JSON.parse(it))
  let listing = await create(
    {
      ...req.body,
      owner: req.user._id,
    },
    false
  )
  await listing.save()
  req.response = {
    listing,
    status: "success",
    statusCode: 201,
  }
  return next()
})

module.exports.getListing = routeTryCatcher(async function (req, res, next) {
  const listing = await findOne({ _id: req.params.id })
  req.response = {
    statusCode: 200,
    listing,
    status: "success",
  }
  return next()
})

module.exports.updateListing = routeTryCatcher(async function (req, res, next) {
  const {
    lookingFor,
    photos,
    owner,
    isStudioApartment,
    numberOfBedrooms,
    streetAddress,
    city,
    country,
    rentAmount,
    rentDuration,
    currentOccupancyCount,
    description,
    latitude,
    longitude,
    features,
  } = req.body
  let apartmentTypeError = null
  if (isStudioApartment === false && numberOfBedrooms === 0)
    apartmentTypeError = "Please specify the number of bedrooms"
  else if (isStudioApartment === true && numberOfBedrooms > 0)
    apartmentTypeError =
      "Apartment can either be studio or have multiple bedrooms"
  if (apartmentTypeError !== null)
    return next(new CustomError(`${apartmentTypeError}`, 400))
  const listing = await updateOne(
    { _id: req.params.id, owner: req.user._id.toString() },
    {
      longitude,
      latitude,
      lookingFor,
      photos,
      owner,
      isStudioApartment,
      numberOfBedrooms,
      streetAddress,
      city,
      country,
      rentAmount,
      rentDuration,
      currentOccupancyCount,
      description,
      streetAddress,
      features,
    }
  )
  req.response = {
    listing,
    statusCode: 200,
    status: "success",
  }
  return next()
})

module.exports.getMultipleListings = routeTryCatcher(async function (
  req,
  res,
  next
) {
  const listings = await findMany(req.query)
  req.response = {
    statusCode: 200,
    listings,
    status: "success",
  }
  return next()
})

module.exports.getUsersListings = routeTryCatcher(async function (
  req,
  res,
  next
) {
  const active = await findMany({ owner: req.user._id, isActive: true })
  const drafts = await findMany({ owner: req.user._id, isDraft: true })
  const deactivated = await findMany({
    owner: req.user._id,
    isActive: false,
    isDraft: false,
  })
  req.response = {
    statusCode: 200,
    listings: {
      active,
      drafts,
      deactivated,
    },
    status: "success",
  }
  return next()
})
module.exports.deleteListing = routeTryCatcher(async function (req, res, next) {
  const listing = await deleteOne({
    _id: req.params.id,
    owner: req.user._id.toString(),
  })
  req.response = {
    statusCode: 204,
    listing,
    status: "success",
    message: "Listing deleted successfully"
  }
  return next()
})

module.exports.deactivateListing = routeTryCatcher(async function (
  req,
  res,
  next
) {
  const listing = await Listing.findOneAndUpdate(
    {
      _id: req.params.id,
      owner: req.user._id.toString(),
      isActive: true,
    },
    { isActive: false },
    { new: true }
  )
  req.response = {
    statusCode: 200,
    listing,
    status: "success",
    message: "Listing deactivated!"
  }
  return next()
})
module.exports.activateListing = routeTryCatcher(async function (
  req,
  res,
  next
) {
  console.log(req.params.id)
  const alreadyActiveListing = await Listing.findOne({
    _id: { $ne: req.params.id },
    isActive: true,
    owner: req.user._id,
  })
  if (alreadyActiveListing)
    return next(
      new CustomError(
        "You already have an active listing. Deactivate it in order to activate a different one.",
        400
      )
    )
  const listing = await Listing.findOneAndUpdate(
    {
      _id: req.params.id,
      isActive: false,
      owner: req.user._id,
    },
    { isActive: true },
    { new: true }
  )
  req.response = {
    listing,
    statusCode: 200,
    status: "success",
    message: "Listing activated"
  }
  return next()
})
