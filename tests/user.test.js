const request = require("supertest")
const app = require("../app")
const { expect } = require("@jest/globals")
const { connectDB, dropDBAndDisconnect, dropCollection } = require("./db");
const { signupDefaultUser, login, verifyEmail, } = require("./auth.utils");
const { seedUsers } = require("./seed");
const users = require("./seeds/users.json")

require("./db")
require("dotenv").config();

let server
beforeAll(async () => {
  await connectDB()
  server = app.listen(4000)
})

afterAll(async () => {
  await dropDBAndDisconnect()
  server?.close()
})

describe("User signup, Email Verification, Login and CRUD Operations", () => {
  afterAll(async () => {
    await dropCollection("users")
  })
  let user = null
  let token = null
  it("should signup user: POST /api/v1/users", async () => {
    const response = await signupDefaultUser(server)
    const { body } = await response
    user = body.user
    expect(body.statusCode).toBe(201)
    expect(body.status).toBe("success")
  })
  it("should verify users email: GET /api/v1/users/verify-email/:id/:emailVerificationToken", async () => {
    const response = await verifyEmail(server)(user._id, user.emailVerificationToken)
    expect(response.body.status).toBe("success")
    expect(response.body.user._id).toBe(user._id)
    expect(response.body.statusCode).toBe(200)
  })
  it("should login user with verified email: POST /api/v1/users/login", async () => {
    const response = await login(server)
    token = response.body.token
    expect(response.body.token).not.toBe(undefined)
    expect(response.body.user._id).toBe(user._id)
    expect(response.body.status).toBe("success")
    expect(response.body.statusCode).toBe(200)
  })
  it("should allow get many with authorization", async () => {
    const response = await request(server)
      .get(`/api/v1/users`)
      .set("authorization", `Bearer ${token}`)
      .expect(200)
    expect(response.body.users).toBeInstanceOf(Array)
  })
  it("should allow update with authorization", async () => {
    const response = await request(server)
      .put(`/api/v1/users/${user?._id}`)
      .set("authorization", `Bearer ${token}`)
      .send({ firstName: "anewname" })
      .expect(200)
    expect(response.body.user.firstName).toEqual("anewname")
  })
  it("should allow get with authorization", () => {
    request(server)
      .get(`/api/v1/users/${user?._id}`)
      .set("authorization", `Bearer ${token}`)
      .send({ firstName: "anewname" })
      .expect(200)
  })
  it("should allow delete with authorization", () => {
    request(server)
      .get(`/api/v1/users/${user?._id}`)
      .set("authorization", `Bearer ${token}`)
      .send({ firstName: "anewname" })
      .expect(200)
  })
})


describe("User Schema Validation And Auto Modification Validation", () => {
  afterAll(async () => {
    await dropCollection("users")
  })
  let user, token
  it("Pets and hasPets in tandem: Does not allow truthy value for hasPets field if pets.length is < 1 or if hasPets is falsy and pets.length > 0", async () => {
    const { body } = await signupDefaultUser(server)
    user = body.user
    await verifyEmail(server)(user._id, user.emailVerificationToken)
    const response = await login(server)
    token = response.body.token
     await request(server)
    .put(`/api/v1/users/${user._id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ hasPets: true, pets: [] })
    .expect(400)
  })
  it("Allows truthy value for hasPets field if pets.length is >= 1", async () => {
    const updatedUserResponse = await request(server)
    .put(`/api/v1/users/${user._id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ hasPets: true, pets: ["dog"] })
    .expect(200)
    const updatedUser = updatedUserResponse.body.user
    expect(updatedUser.hasPets).toBeTruthy()
    expect(updatedUser.pets.length).toBeLessThanOrEqual(1)
  })
  it("Allergies and hasAllergies in tandem: Does not allow truthy value for hasAllergies field if allergies.length is < 1 or if hasAllergies is falsy and allergies.length > 0", async () => {
     await request(server)
    .put(`/api/v1/users/${user._id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ hasAllergies: true, allergies: [] })
    .expect(400)
  })
  it("Allows truthy value for hasAllergies field if allergies.length is >= 1", async () => {
    const updatedUserResponse = await request(server)
    .put(`/api/v1/users/${user._id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ hasAllergies: true, allergies: ["peanut butter"] })
    .expect(200)
    const updatedUser = updatedUserResponse.body.user
    expect(updatedUser.hasAllergies).toBeTruthy()
    expect(updatedUser.allergies.length).toBeLessThanOrEqual(1)
  })
  it("Auto completes user.isProfileComplete when all user data has been provided", async () => {
    const updatedUserResponse = await request(server)
      .put(`/api/v1/users/${user._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        phoneNumber: "123456", 
        countryCode: "234",
        isEmailVerified: true,
        dob:"2001-12-19T13:39:07.834Z", profileImage: "", about: "about",
        origin: {
          state: "Rivers", country: "Nigeria"
        },
        earliestMoveDate: new Date(Date.now()), lookingFor: "room",
        gender: "female", address: {
          streetAddress: "street",
          city: "city",
          state: "state"
        }, hasPets: false, pets: [], hasAllergies: false, allergies: [], budget: 300, isStudent: true, school: "uniport", major: "Computer science" })
      .expect(200)
    const updatedUser = updatedUserResponse.body.user
    expect(updatedUser.isProfileComplete).toBeTruthy()
    expect(updatedUser.allergies.length).toBeLessThanOrEqual(1)
  })
})

describe("Unique username and email", () => {
  afterAll(async () => {
    await dropCollection("users")
  })
  let user
  it("Does not allow multiple users with the same email", async () => {
    const user1Response = await signupDefaultUser(server)
    user = await user1Response.body.user
    const user2Response = await user1Response.status === 201 && await signupDefaultUser(server)
    expect(user1Response.status).toBe(201)
    expect(user2Response.status) .toBe(400)
  })
  it("Does not allow multiple users with the same username", async () => {
    const users = await seedUsers(1)
    await verifyEmail(server)(await user._id, await user.emailVerificationToken)
    const loginResponse = await login(server)
    await request(server)
      .put(`/api/v1/users/${user._id}`)
      .set("Authorization", `Bearer ${loginResponse.body.token}`)
      .send({ userName: users[0].userName })
      .expect(400)
  })
})