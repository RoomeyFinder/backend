
const request = require("supertest")
const app = require("../app");
const { signupData } = require("./user.features");

module.exports.signup = async () => {
  return await request(app)
    .post("/api/v1/users")
    .send(signupData)
    .set("Accept", "application/json")
    .expect("Content-Type", /json/)
}

module.exports.login = async () => {
  return await request(app)
    .post("/api/v1/users/login")
    .send({
      emailOrUserName: signupData.email,
      password: signupData.password,
    })
    .set("Accept", "application/json")
    .expect("Content-Type", /json/)
}

module.exports.verifyEmail = async (userId, emailVerificationToken) => {
  return await request(app)
    .get(`/api/v1/users/verify-email/${userId}/${emailVerificationToken}`)
    .set("Accept", "application/json")
    .expect("Content-Type", /json/)
}
