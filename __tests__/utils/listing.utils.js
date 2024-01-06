
const listingsJson = require("../seeds/listings.json")
const request = require('supertest')
const path = require("path")

const sendListingRequestWithBody = async (server, method, route, data, token) => {
  if (data.photos) {
    const requestObj = 
    request(server)[method](route)
      .set("Authorization", token ? `Bearer ${token}` : "")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
    Object.keys(data).forEach(key => {
      if(key !== "photos"){
        if (key === "address") {
          requestObj.field(key, JSON.stringify(data[key]))
        } else requestObj.field(key, data[key])
      }
    })
    for (let idx = 0; idx < data.photos.length; idx++) {
      const photo = data.photos[idx];
      requestObj.attach("photos", photo)
    }
    return await requestObj
  } else {
    return await request(server)[method](route)
      .send(data)
      .set("Authorization", token ? `Bearer ${token}` : "")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
  }
}
const createListing = async (server, data, token) => {
  return await sendListingRequestWithBody(server, "post", "/api/v1/listings", data, token)
}

const updateListing = async (server, listingId, update, token) => {
  return await sendListingRequestWithBody(server, "put", `/api/v1/listings/${listingId}`, update, token)
}

const sendEmptyBodyRequest = async (server, method, route, token) => {
  return await request(server)
    [method](route)
    .set("Authorization", token ? `Bearer ${token}` : "")
    .set("Accept", "application/json")
    .expect("Content-Type", /json/)
}

module.exports.createListing = function (server, token) {
  return async function (userId, fields = null, photosCount = 3) {
    const photos = getPhotos(photosCount)
    if(!fields)
      return await createListing(server, { ...listingsJson[0], owner: userId, photos }, token)
    else {
      let listing = {}
      for (let idx = 0; idx < fields.length; idx++) {
        listing[fields[idx]] = listingsJson[0][fields[idx]]
        if(fields[idx] === "photos") listing[fields[idx]] = photos
      }
      return await createListing(server, listing, token)
    }
  }
}

module.exports.updateListing = function (server, token) {
  return async function (listingId, update = {}, photosCount) {
    update.photos = getPhotos(photosCount)
    return await updateListing(server, listingId, update, token)
  }
}
module.exports.getListing = function (server, token) {
  return async function (listingId) {
    return await sendEmptyBodyRequest(server, "get", `/api/v1/listings/${listingId}`, token)
  }
}
module.exports.getMultipleListings = function (server, token) {
  return async function(){
    return await sendEmptyBodyRequest(server, "get", "/api/v1/listings", token)
  }
}
module.exports.deleteListing = function (server, token) {
  return async function (listingId) {
    return await sendEmptyBodyRequest(server, "delete", `/api/v1/listings/${listingId}`, token)
  }
}

function getPhotos(photosCount){
  let i = 1
  let photos = []
  while (i <= photosCount) {
    photos.push(path.resolve(__dirname, `../seeds/images/photo-1.png`))
    i++
  }
  return photos
}
