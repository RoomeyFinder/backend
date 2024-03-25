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
const cloudinary = require("../utils/cloudinary")

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
  let {
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
    photosToDelete,
    isActivated,
    isDraft,
  } = req.body
  if (photosToDelete) {
    if (Array.isArray(photosToDelete)) {
      photosToDelete = photosToDelete.map(async (photo) => {
        if (typeof photo !== "string") return photo
        return JSON.parse(photo).public_id
      })
      await Promise.all(
        photosToDelete.map(async (photo) => {
          if (typeof photo !== "string") return
          return await cloudinary.uploader.destroy(JSON.parse(photo).public_id)
        })
      )
    }
    if (typeof photosToDelete === "string")
      await cloudinary.uploader.destroy(JSON.parse(photosToDelete).public_id)
  }
  if (features) {
    if (Array.isArray(features)) {
      features = features.map((feature) => {
        if (typeof feature === "string") return JSON.parse(feature)
        return feature
      })
    } else if (typeof features === "string") features = [JSON.parse(features)]
  } else features = []

  let apartmentTypeError = null
  if (
    (isStudioApartment === "false" || isStudioApartment === false) &&
    numberOfBedrooms === 0
  )
    apartmentTypeError = "Please specify the number of bedrooms"
  else if (
    (isStudioApartment === "true" || isStudioApartment === true) &&
    numberOfBedrooms > 0
  )
    apartmentTypeError =
      "Apartment can either be studio or have multiple bedrooms"
  if (apartmentTypeError !== null)
    return next(new CustomError(`${apartmentTypeError}`, 400))
  const originalCountOfPhotos = photos?.length
  photos = photos?.filter((photo) => typeof photo.secure_url === "string")
  const listing = await updateOne(
    { _id: req.params.id, owner: req.user._id.toString() },
    {
      longitude,
      latitude,
      lookingFor,
      photos,
      photosToDelete,
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
      isActivated: JSON.parse(isActivated) ,
      isDraft: JSON.parse(isDraft),
    }
  )
  req.response = {
    listing,
    statusCode: 200,
    status: "success",
    message: `${
      photos?.length < originalCountOfPhotos
        ? "Some photos failed to upload"
        : "Listing updated successfully"
    }`,
  }
  return next()
})

module.exports.getMultipleListings = routeTryCatcher(async function (
  req,
  res,
  next
) {
  const listings = await findMany({
    ...req.query,
    ...(req.user ? { owner: { $ne: req.user?._id } } : {}),
  })
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
  const listings = await findMany({ owner: req.user._id })
  req.response = {
    statusCode: 200,
    listings,
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
    message: "Listing deleted successfully",
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
      isActivated: true,
    },
    { isActivated: false },
    { new: true }
  )
  req.response = {
    statusCode: 200,
    listing,
    status: "success",
    message: "Listing deactivated!",
  }
  return next()
})
module.exports.activateListing = routeTryCatcher(async function (
  req,
  res,
  next
) {
  const alreadyActiveListing = await Listing.findOne({
    _id: { $ne: req.params.id },
    isActivated: true,
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
      isActivated: false,
      owner: req.user._id,
    },
    { isActivated: true },
    { new: true }
  )
  req.response = {
    listing,
    statusCode: 200,
    status: "success",
    message: "Listing activated",
  }
  return next()
})
