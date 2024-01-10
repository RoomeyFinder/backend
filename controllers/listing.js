const Listing = require("../models/listing");
const MongooseQueryBuilder = require("@exploitenomah/mongoose-query-builder");
const { formatLocation, concatToArrayUntilMax } = require("../utils");

module.exports.create = async function (data = {}, save = false) {
  const { 
    idealRoommateDescription,
    photos,
    owner,
    isStudioApartment,
    numberOfBedrooms,
    longitude, latitude,
    streetAddress,
    city,
    state,
    country,
    rentAmount,
    rentDuration,
    currentOccupancyCount,
    description,
    features,
    isDraft
  } = data

  const expireAt = new Date(Date.now())
  expireAt.setFullYear(expireAt.getFullYear() + 1)
  let newListing = new Listing({
    ...(longitude && latitude ? {location:  formatLocation(longitude, latitude)} : {}),
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
    features,
    isDraft,
    isActive: isDraft ? false : true
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
    "idealRoommateDescription",
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
    "isActive",
    "features",
  ]
  const listing = await Listing.findOne(filter)
  Object.keys(update).forEach(key => {
    if (allowedPaths.includes(key) && update[key] !== undefined) {
      if (key !== "longitude" && key !== "latitude" && key !== "photos" && key !== "features")
        listing[key] = update[key]
    }
  })
  if (update.longitude !== undefined && update.latitude !== undefined) {
    listing[location] = formatLocation(update.longitude, update.latitude)
  }
  if(Array.isArray(update.photos))
    listing.photos = concatToArrayUntilMax(10, listing.photos, update.photos)
  if(Array.isArray(update.features))
    listing.features = concatToArrayUntilMax(20, listing.features, update.features)
  return await listing.save()
}

module.exports.deleteOne = async function (filter = {}) {
  return await Listing.findOneAndDelete(filter)
}
