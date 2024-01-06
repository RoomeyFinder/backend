const Listing = require("../../models/listing")
const User = require("../../models/user")
const { getPhotos } = require("../utils")
const listingsJson = require("./listings.json")
const usersJson = require("./users.json")

module.exports = async function () {
  const users = await Promise.all(usersJson.map(async (user) => {
    return await User.create({
      ...user,
      isEmailVerified: true,
      currentLocation: {
        type: "Point",
        coordinates: [user.longitude, user.latitude]
      },
      phone: {
        countryCode: user.countryCode,
        number: user.phoneNumber
      },
      address: {
        streetAddress: "street",
        city: "city",
        state: "state"
      },
    })
  }))
  const listingPhotos = getPhotos(3)
  const listings = await Promise.all(listingsJson.map(async (listing, idx) => {
    return await Listing.create({...listing, owner: users[idx]._id, location: {
      type: "Point",
      coordinates: [listing.longitude, listing.latitude]
    },
    photos: listingPhotos.map(photo => ({ 
      asset_id: photo,
      public_id: photo,
      width: 100, height: 100,
      secure_url: photo,
      etag: photo,
      created_at: new Date(Date.now()),
    }))
  }) 
  }))
  return {
    users, 
    listings
  }
}
