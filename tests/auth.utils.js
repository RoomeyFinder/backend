
const request = require("supertest")
const app = require("../app");
const { signupData } = require("./user.features");

module.exports.signupDefaultUser = async (server) => {
  return await request(server)
    .post("/api/v1/users")
    .send(signupData)
    .set("Accept", "application/json")
    .expect("Content-Type", /json/)
}

module.exports.signupUser = async (data) => {
  return await request(app)
    .post("/api/v1/users")
    .send(data)
    .set("Accept", "application/json")
    .expect("Content-Type", /json/)
}

module.exports.login = async (server) => {
  return await request(server)
    .post("/api/v1/users/login")
    .send({
      emailOrUserName: signupData.email,
      password: signupData.password,
    })
    .set("Accept", "application/json")
    .expect("Content-Type", /json/)
}

module.exports.verifyEmail = (server) => async (userId, emailVerificationToken) => {
  return await request(server)
    .get(`/api/v1/users/verify-email/${userId}/${emailVerificationToken}`)
    .set("Accept", "application/json")
    .expect("Content-Type", /json/)
}
