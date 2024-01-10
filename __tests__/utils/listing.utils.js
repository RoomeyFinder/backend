
const listingsJson = require("../seeds/listings.json")
const { getPhotos, sendMultipartBodyRequest } = require(".")


module.exports.createListing = function (server, token) {
  return async function (userId, fields = null, photosCount = 3,) {
    const photos = getPhotos(photosCount)
    const send = async (server, data, token) =>  
      await sendMultipartBodyRequest(server, "post", "/api/v1/listings", data, token)
    if(!fields)
      return await send(server, { ...listingsJson[0], owner: userId, photos, isDraft: false }, token)
    else {
      let listing = {}
      for (let idx = 0; idx < fields.length; idx++) {
        listing[fields[idx]] = listingsJson[0][fields[idx]]
        if(fields[idx] === "photos") listing[fields[idx]] = photos
      }
      return await send(server, listing, token)
    }
  }
}
module.exports.updateListing = function (server, token) {
  return async function (listingId, update = {}, photosCount) {
    update.photos = getPhotos(photosCount)
    return await sendMultipartBodyRequest(server, "put", `/api/v1/listings/${listingId}`, update, token)
  }
}