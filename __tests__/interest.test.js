const { sendEmptyBodyRequest, sendRequestWithBody } = require("./utils");
const app = require('../app')
const { expect } = require('@jest/globals')
const { connectDB, dropDBAndDisconnect } = require('./utils/db')
const { createAuthorizedUser } = require("./utils/auth.utils");
const seed = require("./seeds/seed");
const { login } = require("./utils/auth.utils")

let server, token, listings, users, usersAtIdxZeroToken

beforeAll(async () => {
  await connectDB()
  server = app.listen(3000)
})

beforeAll(async () => {
  ({ token } = await createAuthorizedUser(server))
})

beforeAll(async () => {
  ({ listings, users } = await seed())
})

afterAll(async () => {
  server?.close()
  await dropDBAndDisconnect()
})

describe("Interests", () => {
  let listingInterest = null
  let userInterest = null
  it("Should Create a listing Interest", async () => {
    const response = await sendRequestWithBody(server, "post", "/api/v1/interests", {
      doc: listings[0]._id,
      type: "Listing"
    }, token)
    expect(response.status).toBe(201)
    listingInterest = response.body.interest
  })
  it("Should Create a User Interest", async () => {
    const response = await sendRequestWithBody(server, "post", "/api/v1/interests", {
      doc: users[0]._id,
      type: "User"
    }, token)
    expect(response.status).toBe(201)
    userInterest = response.body.interest
  })
  it("Should return already created Listing interest if interest exists and create is attempted", async () => {
    const response = await sendRequestWithBody(server, "post", "/api/v1/interests", {
      doc: listings[0]._id,
      type: "Listing"
    }, token)
    expect(response.status).toBe(201)
    expect(listingInterest._id).toEqual(response.body.interest._id)
    listingInterest = response.body.interest
  })
  it("Should return already created User interest if interest exists and create is attempted", async () => {
    const response = await sendRequestWithBody(server, "post", "/api/v1/interests", {
      doc: users[0]._id,
      type: "User"
    }, token)
    expect(response.status).toBe(201)
    expect(userInterest._id).toEqual(response.body.interest._id)
    userInterest = response.body.interest
  })
  it("Should get interest by interest id", async () => {
    const response = await sendEmptyBodyRequest(server, "get", `/api/v1/interests/${listingInterest._id}`, token)
    expect(response.status).toBe(200)
    expect(response.body.interest._id).toEqual(listingInterest._id)
    listingInterest = response.body.interest
  })
  it("Should get multiple interests", async () => {
    const response = await sendEmptyBodyRequest(server, "get", `/api/v1/interests`, token)
    expect(response.status).toBe(200)
    expect(response.body.interests.length).toEqual(2)
  })
  it("Should get interests of authorized user if user is the doc of interest", async () => {
    const loginResponse = await (login(server)({
      emailOrUserName: users[0].email,
      password: "dev1234"
    }))
    usersAtIdxZeroToken = loginResponse.body.token
    const interestsResponse = await sendEmptyBodyRequest(server, "get", "/api/v1/interests", usersAtIdxZeroToken)
    expect(interestsResponse.status).toEqual(200)
    expect(interestsResponse.body.interests.length).toEqual(1)
    expect(interestsResponse.body.interests[0].doc).toEqual(loginResponse.body.user._id)
  })
  it("Should only permit interest.doc to update interest", async () => {
    const loginResponse = await (login(server)({
      emailOrUserName: users[0].email,
      password: "dev1234"
    }))
    const authorizedUserToken = loginResponse.body.token  
    const unauthorizedResponse = await sendRequestWithBody(server, "put", `/api/v1/interests/${userInterest._id}`, { accepted: true }, token)
    expect(unauthorizedResponse.status).toEqual(403)
    const response = await sendRequestWithBody(server, "put", `/api/v1/interests/${userInterest._id}`, { accepted: true }, authorizedUserToken)
    expect(response.body.interest.doc).toEqual(loginResponse.body.user._id)
    expect(response.status).toBe(200)
  })
  it("Should only permit interest owners to delete interest", async () => {  
    const loginResponse = await (login(server)({
      emailOrUserName: users[0].email,
      password: "dev1234"
    }))
    const unauthorizedUserToken = loginResponse.body.token  
    const unauthorizedDeleteResponse = await sendEmptyBodyRequest(server, "delete", `/api/v1/interests/${listingInterest._id}`, unauthorizedUserToken)
    expect(unauthorizedDeleteResponse.body.interest).toBeNull()
    expect(unauthorizedDeleteResponse.body.statusCode).toBe(403)
    const response = await sendEmptyBodyRequest(server, "delete", `/api/v1/interests/${listingInterest._id}`, token)
    expect(response.status).toEqual(200)
    expect(response.body.interest._id).toEqual(listingInterest._id)
    const responseToVerifyDeletedBookmark = await sendEmptyBodyRequest(server, "delete", `/api/v1/interests/${listingInterest._id}`, token)
    expect(responseToVerifyDeletedBookmark.body.interest).toBeNull()
  })
})


