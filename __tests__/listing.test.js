const request = require('supertest')
const app = require('../app')
const { expect } = require('@jest/globals')
const { connectDB, dropDBAndDisconnect, dropCollection } = require('./utils/db')
const { createAuthorizedUser, login, verifyEmail } = require("./utils/auth.utils")


let server, user, token

beforeAll(async () => {
  await connectDB()
  server = app.listen(3000)
})

beforeAll(async () => {
  ({ user, token } = await createAuthorizedUser(server))
})

afterAll(async () => {
  console.log("server")
  server?.close()
  await dropDBAndDisconnect()
})
describe("Create listing", () => {
  it.only("should create a listing", async () => {

    console.log(user, token)
  })

})