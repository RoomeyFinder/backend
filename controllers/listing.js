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
  const allowedPaths = [
    "idealRoommateDescription",
    "photos",
    "isStudioApartment",
    "numberOfBedrooms",
    "longitude", 
    "latitude",
    "address",
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
      if (key !== "longitude" && key !== "latitude" && key !== "photos")
        listing[key] = update[key]
    }
  })
  if (update.longitude !== undefined && update.latitude !== undefined) {
    listing[location] = formatLocation(update.longitude, update.latitude)
  }
  if(Array.isArray(update.photos) && update.photos.length > 0){
    let photosCount = listing.photos.length
    if(photosCount <= 9){
      let maxAppendablePhotos = 10 - photosCount 
      maxAppendablePhotos = update.photos.length <= maxAppendablePhotos ? update.photos.length : maxAppendablePhotos
      let photoIdxToAppend = 0
      while(maxAppendablePhotos > 0){
        listing.photos = [...listing.photos, update.photos[photoIdxToAppend]]
        photoIdxToAppend++
        maxAppendablePhotos--
      }
    }
  }
    
  return await listing.save()
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
