const { create, findOne, findMany, updateOne, deleteOne } = require("../controllers/listing")
const CustomError = require("../utils/error")
const { routeTryCatcher } = require("../utils/routes")

module.exports.createListing = routeTryCatcher(async function(req, res, next){
  const existingListing = await findOne({ owner: req.user._id.toString(), $or: [{ isActive: true, isDraft: false }, { isDraft: false, isActive: false }] })
  if (existingListing) return next(new CustomError("Cannot create a new Ad. Existing Ad must first be deleted", 400))
  let listing = await create({ 
    ...req.body, 
    owner: req.user._id,
  }, false)
  await listing.save()
  req.response = {
    listing,
    status: "success",
    statusCode: 201
  }
  return next()
})

module.exports.getListing = routeTryCatcher(async function (req, res, next) {
  const listing = await findOne({ _id: req.params.id })
  req.response = {
    statusCode: 200,
    listing,
    status: "success"
  }
  return next()
})

module.exports.updateListing = routeTryCatcher(async function(req, res, next){
  const {
    idealRoommateDescription,
    photos,
    owner,
    isStudioApartment,
    numberOfBedrooms,
    streetAddress,
    city,
    state,
    country,
    rentAmount,
    rentDuration,
    currentOccupancyCount,
    description,
    latitude,
    longitude,
    features
  } = req.body
  let apartmentTypeError = null
  if(isStudioApartment === false && numberOfBedrooms === 0) apartmentTypeError = "Please specify the number of bedrooms" 
  else if (isStudioApartment === true && numberOfBedrooms > 0) apartmentTypeError = "Apartment can either be studio or have multiple bedrooms"
  if (apartmentTypeError !== null)
    return next(new CustomError(`${apartmentTypeError}`, 400))
  const listing = await updateOne({ _id: req.params.id, owner: req.user._id.toString() }, {
    longitude,
    latitude,
    idealRoommateDescription,
    photos,
    owner,
    isStudioApartment,
    numberOfBedrooms,
    streetAddress,
    city,
    state,
    country,
    rentAmount,
    rentDuration,
    currentOccupancyCount,
    description,
    streetAddress,
    city,
    state,
    country,
    features
  })
  req.response = {
    listing,
    statusCode: 200,
    status: "success"
  }
  return next()
})

module.exports.getMultipleListings = routeTryCatcher(async function (req, res, next) {
  const listings = await findMany(req.query)
  req.response = {
    statusCode: 200,
    listings,
    status: "success"
  }
  return next()
})
module.exports.deleteListing = routeTryCatcher(async function (req, res, next) {
  const listing = await deleteOne({ _id: req.params.id, owner: req.user._id.toString() })
  req.response = {
    statusCode: 200,
    listing,
    status: "success"
  }
  return next()
})