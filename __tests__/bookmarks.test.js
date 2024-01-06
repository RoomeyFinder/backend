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

describe("Bookmarks", () => {
  let listingBookmark = null
  let userBookmark = null
  it("Should Create a Listing Bookmark", async () => {
    const response = await sendRequestWithBody(server, "post", "/api/v1/bookmarks", {
      doc: listings[0]._id,
      type: "Listing"
    }, token)
    expect(response.status).toBe(201)
    listingBookmark = response.body.bookmark
  })
  it("Should Create a User Bookmark", async () => {
    const response = await sendRequestWithBody(server, "post", "/api/v1/bookmarks", {
      doc: users[0]._id,
      type: "User"
    }, token)
    expect(response.status).toBe(201)
    userBookmark = response.body.bookmark
  })
  it("Should return already created Listing bookmark if bookmark exists and create is attempted", async () => {
    const response = await sendRequestWithBody(server, "post", "/api/v1/bookmarks", {
      doc: listings[0]._id,
      type: "Listing"
    }, token)
    expect(response.status).toBe(201)
    expect(listingBookmark._id).toEqual(response.body.bookmark._id)
    listingBookmark = response.body.bookmark
  })
  it("Should return already created User bookmark if bookmark exists and create is attempted", async () => {
    const response = await sendRequestWithBody(server, "post", "/api/v1/bookmarks", {
      doc: users[0]._id,
      type: "User"
    }, token)
    expect(response.status).toBe(201)
    expect(userBookmark._id).toEqual(response.body.bookmark._id)
    userBookmark = response.body.bookmark
  })
  it("Should get bookmark by bookmark id", async () => {
    const response = await sendEmptyBodyRequest(server, "get", `/api/v1/bookmarks/${listingBookmark._id}`, token)
    expect(response.status).toBe(200)
    expect(response.body.bookmark._id).toEqual(listingBookmark._id)
    listingBookmark = response.body.bookmark
  })
  it("Should get multiple bookmarks", async () => {
    const response = await sendEmptyBodyRequest(server, "get", `/api/v1/bookmarks`, token)
    expect(response.status).toBe(200)
    expect(response.body.bookmarks.length).toEqual(2)
  })
  it("Should get only bookmarks by authorized user", async () => {
    const loginResponse = await (login(server)({
      emailOrUserName: users[0].email,
      password: "dev1234"
    }))
    usersAtIdxZeroToken = loginResponse.body.token
    const bookmarksResponse = await sendEmptyBodyRequest(server, "get", "/api/v1/bookmarks", usersAtIdxZeroToken)
    expect(bookmarksResponse.status).toEqual(200)
    expect(bookmarksResponse.body.bookmarks.length).toEqual(0)
  })
  it("Should only permit bookmark owner to delete bookmark", async () => {
    const unauthorizedDeleteResponse = await sendEmptyBodyRequest(server, "delete", `/api/v1/bookmarks/${listingBookmark._id}`, usersAtIdxZeroToken)
    expect(unauthorizedDeleteResponse.body.bookmark).toBeNull() 
    const response = await sendEmptyBodyRequest(server, "delete", `/api/v1/bookmarks/${listingBookmark._id}`, token)
    expect(response.status).toEqual(200)
    expect(response.body.bookmark._id).toEqual(listingBookmark._id)
    const responseToVerifyDeletedBookmark = await sendEmptyBodyRequest(server, "delete", `/api/v1/bookmarks/${listingBookmark._id}`, token)
    expect(responseToVerifyDeletedBookmark.body.bookmark).toBeNull() 
  })
})


