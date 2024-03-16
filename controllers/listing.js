const Listing = require("../models/listing")
const MongooseQueryBuilder = require("@exploitenomah/mongoose-query-builder")
const { formatLocation, concatToArrayUntilMax } = require("../utils")

module.exports.create = async function (data = {}, save = false) {
  const {
    lookingFor,
    photos,
    owner,
    isStudioApartment,
    numberOfBedrooms,
    longitude,
    latitude,
    streetAddress,
    city,
    country,
    rentAmount,
    rentDuration,
    currentOccupancyCount,
    description,
    features,
    isDraft,
    isActivated,
  } = data
  const expireAt = new Date(Date.now())
  expireAt.setFullYear(expireAt.getFullYear() + 1)
  let newListing = await Listing.create({
    ...(longitude && latitude
      ? { location: formatLocation(longitude, latitude) }
      : {}),
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
    features,
    isDraft,
    isActivated,
  })
  if (save) return await newListing.save()
  return newListing
}

module.exports.findMany = async function (query = {}) {
  const listingsQuery = new MongooseQueryBuilder(Listing, query)
  return await listingsQuery.find()
}

module.exports.findOne = async function (filter = {}) {
  return await Listing.findOne(filter)
}

module.exports.updateOne = async function (filter = {}, update = {}) {
  const allowedPaths = [
    "lookingFor",
    "photos",
    "isStudioApartment",
    "numberOfBedrooms",
    "longitude",
    "latitude",
    "streetAddress",
    "city",
    "state",
    "country",
    "rentAmount",
    "rentDuration",
    "currentOccupancyCount",
    "description",
    "isActivated",
    "features",
    "isDraft"
  ]
  const listing = await Listing.findOne(filter)
  Object.keys(update).forEach((key) => {
    if (allowedPaths.includes(key) && update[key] !== undefined) {
      if (
        key !== "longitude" &&
        key !== "latitude" &&
        key !== "photos" &&
        key !== "features"
      )
        listing[key] = update[key]
    }
  })
  if(update.isDraft !== undefined) listing.isDraft = JSON.parse(update.isDraft)
  if (update.isActivated !== undefined)
  listing.isActivated = JSON.parse(update.isActivated)
  if (update.longitude !== undefined && update.latitude !== undefined) {
    listing.location = formatLocation(update.longitude, update.latitude)
  }
  if (Array.isArray(update.photos))
    listing.photos = concatToArrayUntilMax(10, listing.photos, update.photos)
  if (Array.isArray(update.photosToDelete)) {
    const stringifiedPhotosToDelete = JSON.stringify(update.photosToDelete)
    listing.photos = listing.photos.filter((photo) =>
      stringifiedPhotosToDelete.includes(photo._id)
    )
  }
  if (Array.isArray(update.features)) listing.features = update.features
  return await listing.save()
}

module.exports.deleteOne = async function (filter = {}) {
  return await Listing.findOneAndDelete(filter)
}
