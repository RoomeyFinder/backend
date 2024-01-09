
const listingsJson = require("../seeds/listings.json")
const request = require('supertest')
const { getPhotos } = require(".")
const path = require("node:path")

const sendListingRequestWithBody = async (server, method, route, data, token) => {
  if (data.photos) {
    const requestObj = 
    request(server)[method](route)
      .set("Authorization", token ? `Bearer ${token}` : "")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
    Object.keys(data).forEach(key => {
      if(Array.isArray(data[key])){
        for (let idx = 0;idx < data[key].length;idx++) {
          const value = data[key][idx];
          if(value !== path.basename(value))
            requestObj.attach(key, value)
          else requestObj.field(key, value)
        }
      }else requestObj.field(key, data[key])
    })
    return await requestObj
  } else {
    return await request(server)[method](route)
      .send(data)
      .set("Authorization", token ? `Bearer ${token}` : "")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
  }
}

module.exports.createListing = function (server, token) {
  return async function (userId, fields = null, photosCount = 3) {
    const photos = getPhotos(photosCount)
    const send = async (server, data, token) =>  
      await sendListingRequestWithBody(server, "post", "/api/v1/listings", data, token)
    if(!fields)
      return await send(server, { ...listingsJson[0], owner: userId, photos }, token)
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
    return await sendListingRequestWithBody(server, "put", `/api/v1/listings/${listingId}`, update, token)
  }
}