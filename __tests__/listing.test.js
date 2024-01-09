const path = require('path');
const { createListing, updateListing } = require("./utils/listing.utils")
const app = require('../app')
const { expect } = require('@jest/globals')
const { connectDB, dropDBAndDisconnect } = require('./utils/db')
const { createAuthorizedUser } = require("./utils/auth.utils");
const { sendEmptyBodyRequest } = require("./utils");


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
  const mandatoryFields = [
    'photos',
    'idealRoommateDescription',
    'address',
    'streetAddress',
    'city',
    'state',
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
  it("Should allow a maximum of 20 features per listing", async () => {
    const response = await updateListing(server, token)(listing._id, {
      description: "a new description",
      features: [...Array(40).keys()].map(it => it.toString())
    }, 0)
    expect(response.status).toBe(200)
    expect(response.body.listing.description).toBe("a new description")
    expect(response.body.listing.features.length).toBe(20)
    expect(response.body.listing._id).toBeDefined()
    listing = response.body.listing
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
    const response = await sendEmptyBodyRequest(server, "get", `/api/v1/listings/${listing._id}`, token)
    expect(response.status).toBe(200)
    expect(response.body.listing._id).toBeDefined()
    listing = response.body.listing
  })
  it("Should get multiple listings", async () => {
    const response = await sendEmptyBodyRequest(server, "get", `/api/v1/listings`, token)
    expect(response.body.listings).toBeDefined()
    expect(response.body.listings).toHaveLength(1)
    expect(response.status).toBe(200)
  })
  it("Should delete a listing", async () => {
    const response = await sendEmptyBodyRequest(server, "delete", `/api/v1/listings/${listing._id}`, token)
    expect(response.status).toBe(200)
  })
})


