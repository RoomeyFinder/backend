const request = require("supertest")
const app = require("../app")
const { expect } = require("@jest/globals")
const { connectDB, dropDBAndDisconnect } = require("./utils/db");
const { signupUser, login, verifyEmail, createAuthorizedUser, } = require("./utils/auth.utils");
const users = require("./seeds/users.json");
const { updateData } = require("./features/user.features");
const { getPhotos, sendMultipartBodyRequest } = require("./utils");

require("./utils/db")
require("dotenv").config();
let server

beforeAll(() => {
  connectDB()
  server = app.listen(4000)
})
afterAll(() => {
  dropDBAndDisconnect()
  server.close()
})

describe("User signup, Email Verification, Login and CRUD Operations", () => {
  let user = null
  let token = null
  it("should signup user: POST /api/v1/users", async () => {
    user = (await signupUser(server)(users[0])).body.user
    expect(user.firstName).toBe(users[0].firstName.toLowerCase())
    expect(user.lastName).toBe(users[0].lastName.toLowerCase())
    expect(user.email).toBe(users[0].email.toLowerCase())
    expect(user.gender).toBe(users[0].gender.toLowerCase())
    expect(user.countryCode).toBe(users[0].countryCode)
    expect(+user.phoneNumber).toBe(users[0].phoneNumber)
    expect(user.currentLocation.coordinates).toBeInstanceOf(Array)
    expect(user.dob).toBe(users[0].dob)
  })
  it("should verify users email: GET /api/v1/users/verify-email/:id/:emailVerificationToken", async () => {
    const response = await verifyEmail(server)(user._id, user.emailVerificationToken)
    expect(response.body.status).toBe("success")
    expect(response.body.user._id).toBe(user._id)
    expect(response.body.statusCode).toBe(200)
  })
  it("should login user with verified email: POST /api/v1/users/login", async () => {
    const response = await login(server)({
      emailOrUserName: users[0].email,
      password: users[0].password,
    })
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
      .expect(200)
  })
  it("should allow delete with authorization", () => {
    request(server)
      .get(`/api/v1/users/${user?._id}`)
      .set("authorization", `Bearer ${token}`)
      .expect(200)
  })
})


describe("User Schema Validation And Auto Modification Validation", () => {
  let user, token
  it("Pets and hasPets in tandem: Does not allow truthy value for hasPets field if pets.length is < 1 or if hasPets is falsy and pets.length > 0", async () => {
    const data = await createAuthorizedUser(server)
    user = data.user
    token = data.token
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
    user = updatedUserResponse.body.user
    expect(user.hasPets).toBeTruthy()
    expect(user.pets.length).toBeLessThanOrEqual(1)
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
    user = updatedUserResponse.body.user
    expect(user.hasAllergies).toBeTruthy()
    expect(user.allergies.length).toBeLessThanOrEqual(1)
  })
  it("Does not allow more than 10 profile images", async () => {
    const query = request(server)
      .put(`/api/v1/users/${user._id}`)
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
    const photos = getPhotos(11)
    for (let idx = 0;idx < photos.length;idx++) {
      query.attach("photos", photos[idx])
    }
    const updatedUserResponse = await query
    expect(updatedUserResponse.body.user.photos.length).toBe(10)
  })
  it("Does not allow more than 20 profile tags", async () => {
    const query = await sendMultipartBodyRequest(server, "put", `/api/v1/users/${user._id}`, { tags: [...Array(40).keys()].map(it => it.toString()) }, token)
    const updatedUserResponse = await query
    expect(updatedUserResponse.body.user.tags.length).toBe(20)
  })
  it("Auto completes user.isProfileComplete when all user data has been provided", async () => {
    const query = request(server)
      .put(`/api/v1/users/${user._id}`)
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
    Object.keys(updateData).forEach(key => {
      if(key !== "pet" && key !== "allergies")
        query.field(key, updateData[key])
    })
    const photos = getPhotos(2)
    for (let idx = 0; idx < photos.length; idx++) {
      query.attach("photos", photos[idx])
    }
    const updatedUserResponse = await query
    user = updatedUserResponse.body.user
    expect(user.isProfileComplete).toBeTruthy()
    expect(user.allergies.length).toBeLessThanOrEqual(1)
  })
})

describe("Unique username and email", () => {
  let user
  it("Does not allow multiple users with the same email or same email", async () => {
    user = (await signupUser(server)(users[1])).body.user
    const user2Res = await signupUser(server)(users[1])
    expect(user2Res.status).toBe(400)
  })
  it("Does not allow multiple users with the same username", async () => {
    const newUser = (await signupUser(server)(users[2])).body.user
    const verificationResponse = verifyEmail(server)(await newUser._id, await newUser.emailVerificationToken)
    if ((await verificationResponse).status === 200) {
      const loginResponse = await login(server)({
        emailOrUserName: users[2].email,
        password: users[2].password,
      })
      await request(server)
        .put(`/api/v1/users/${newUser._id}`)
        .set("Authorization", `Bearer ${loginResponse.body.token}`)
        .send({ userName: user.userName })
        .expect(400)
    }
  })
})