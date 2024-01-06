const path = require('path');
const { createListing, updateListing, getListing, deleteListing } = require("./utils/listing.utils")
const app = require('../app')
const { expect } = require('@jest/globals')
const { connectDB, dropDBAndDisconnect } = require('./utils/db')
const { createAuthorizedUser } = require("./utils/auth.utils");


let server, user, token

beforeAll(async () => {
  await connectDB()
  server = app.listen(3000)
})

beforeAll(async () => {
  ({ user, token } = await createAuthorizedUser(server))
})

afterAll(async () => {
  server?.close()
  await dropDBAndDisconnect()
})
describe("Listing", () => {
  let listing = null
  const nonMandatoryFields = [
    'owner',
    'longitude',
    'latitude',
    'numberOfBedrooms',
    'isStudioApartment',
    'features',
  ]
  const mandatoryFields = [
    'photos',
    'idealRoommateDescription',
    'address',
    'rentAmount',
    'rentDuration',
    'currentOccupancyCount',
    'description',
  ]
  it("Should not create listing there is no authorization", async () => {
   const response = await createListing(server)(user._id, null, 0)
   expect(response.status).toBe(403)
   expect(response.body.status).toBe("failed")
   expect(response.body.message).toBe("Unauthorized!")
  })
  it("Should not create listing if photo count is not up to 3", async () => {
   const response = await createListing(server, token)(user._id, null, 0)
   expect(response.status).toBe(500)
   expect(response.body.status).toBe("error")
    expect(response.body.message.toLowerCase()).toBe("listing validation failed: photos: A minimum of 3 photos and a maximum of 10".toLowerCase())
  })
  it("Should not create listing if photo count is greater than 10", async () => {
   const response = await createListing(server, token)(user._id, null, 11)
   expect(response.status).toBe(500)
   expect(response.body.status).toBe("error")
    expect(response.body.message.toLowerCase()).toBe("listing validation failed: photos: A minimum of 3 photos and a maximum of 10".toLowerCase())
  })
  it("Should not create listing if there are missing mandatory fields", async () => {
    const response = await createListing(server, token)(user._id, ["photos"], 0)
    expect(response.status).toBe(500)
    expect(response.body.status).toBe("error")
    expect(
      mandatoryFields
      .every(field => response.body.message.includes(field))).toBe(true)
  })
  it("Should create a listing", async () => {
    const response = await createListing(server, token)(user._id, null, 3)
    expect(response.status).toBe(201)
    expect(response.body.listing._id).toBeDefined()
    listing = response.body.listing
  })
  it("Should not allow user with existing listing to create a new listing", async () => {
    const response = await createListing(server, token)(user._id, null, 3)
    expect(response.status).toBe(400)
    expect(response.body.message).toBe("Cannot create a new Ad. Existing Ad must first be deleted")
  })
  it("Should update a listing", async () => {
    const response = await updateListing(server, token)(listing._id, {
      description: "a new description"
    }, 0)
    expect(response.status).toBe(200)
    expect(response.body.listing.description).toBe("a new description")
    expect(response.body.listing._id).toBeDefined()
    listing = response.body.listing
  })
  it("Should allow photos update for a listing", async () => {
    const response = await updateListing(server, token)(listing._id, {description: "here is another one"}, 1)
    expect(response.status).toBe(200)
    expect(response.body.listing._id).toBeDefined()
    listing = response.body.listing
    expect(response.body.listing.photos.length).toBe(4)
  })
  it("Should get a listing", async () => {
    const response = await getListing(server, token)(listing._id)
    expect(response.status).toBe(200)
    expect(response.body.listing._id).toBeDefined()
    listing = response.body.listing
  })
  it("Should delete a listing", async () => {
    const response = await deleteListing(server, token)(listing._id)
    expect(response.status).toBe(200)
  })
})


