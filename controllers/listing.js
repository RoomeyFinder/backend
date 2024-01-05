const Listing = require("../models/listing");
const MongooseQueryBuilder = require("@exploitenomah/mongoose-query-builder")

module.exports.create = async function (data = {}, save = false) {
  const { 
    idealRoommateDescription,
    photos,
    owner,
    isStudioApartment,
    numberOfBedrooms,
    longitude, latitude,
    address,
    rentAmount,
    rentDuration,
    currentOccupancyCount,
    description 
  } = data

  const expireAt = new Date(Date.now())
  expireAt.setFullYear(expireAt.getFullYear() + 1)

  let newListing = new Listing({
    location: formatLocation(longitude, latitude),
    idealRoommateDescription,
    photos,
    owner,
    isStudioApartment,
    numberOfBedrooms,
    address,
    rentAmount,
    rentDuration,
    currentOccupancyCount,
    description,
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

module.exports.updateOne = async function (filter = {}, update = {}, options = { new: true }) {
  const {
    idealRoommateDescription,
    photos,
    isStudioApartment,
    numberOfBedrooms,
    longitude, 
    latitude,
    address,
    rentAmount,
    rentDuration,
    currentOccupancyCount,
    description,
    features,
  } = update
  return await Listing.findOneAndUpdate(filter, {
    idealRoommateDescription,
    photos,
    isStudioApartment,
    numberOfBedrooms,
    address,
    rentAmount,
    rentDuration,
    currentOccupancyCount,
    description,
    features,
    isActive,
    location: formatLocation(longitude, latitude)
  }, options)
}

module.exports.deleteOne = async function (filter = {}) {
  return await Listing.findOneAndDelete(filter)
}

function formatLocation(lng, lat) {
  return ({
    type: "Point",
    coordinates: [Number(lng), Number(lat)]
  })
}
