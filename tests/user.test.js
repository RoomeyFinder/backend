
const { expect } = require("@jest/globals")
const { connectDB, dropDBAndDisconnect, dropCollection } = require("./db");
const { signup, login, verifyEmail, } = require("./auth.features");

require("./db")
require("dotenv").config();

beforeAll(() => {
  connectDB()
})

afterAll(() => {
  dropDBAndDisconnect()
})

describe("User Signup, Email Verification and Login", () => {
  afterAll(() => {
    dropCollection("users")
  })
  let user = null
  it("should signup user: POST /api/v1/users", async () => {
    const response = await signup()
    const { body } = await response
    user = body.user
    expect(body.statusCode).toBe(201)
    expect(body.status).toBe("success")
  })
  it("should verify users email: GET /api/v1/users/verify-email/:id/:emailVerificationToken", async () => {
    const response = await verifyEmail(user._id, user.emailVerificationToken)
    expect(response.body.status).toBe("success")
    expect(response.body.user._id).toBe(user._id)
    expect(response.body.statusCode).toBe(200)
  })
  it("should login user with verified email: POST /api/v1/users/login", async () => {
    const response = await login()
    expect(response.body.token).not.toBe(undefined)
    expect(response.body.user._id).toBe(user._id)
    expect(response.body.status).toBe("success")
    expect(response.body.statusCode).toBe(200)
  })
})

describe("User Signup, No Email Verification, Login", () => {
  it("should not login user with an verified email: POST /api/v1/users/login", async () => {
    await signup()
    const response = await login()
    expect(response.body.token).toBe(undefined)
    expect(response.body.status).toBe("failed")
    expect(response.body.statusCode).toBe(400)
  })
})
