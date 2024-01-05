
const request = require("supertest")
const { signupData } = require("../features/user.features");

const signupUser = (server) => async (userData) => {
  return (await request(server)
    .post("/api/v1/users")
    .send(userData)
    .set("Accept", "application/json")
    .expect("Content-Type", /json/))
}
const login = (server) => async (loginDetails) => {
  return await request(server)
    .post("/api/v1/users/login")
    .send(loginDetails)
    .set("Accept", "application/json")
    .expect("Content-Type", /json/)
}
const verifyEmail = (server) => async (userId, emailVerificationToken) => {
  return await request(server)
    .get(`/api/v1/users/verify-email/${userId}/${emailVerificationToken}`)
    .set("Accept", "application/json")
    .expect("Content-Type", /json/)
}

module.exports.signupUser = signupUser
module.exports.login = login
module.exports.verifyEmail = verifyEmail

module.exports.createAuthorizedUser = async (server) => {
  const user = (await (signupUser(server))(signupData)).body.user;
  await verifyEmail(server)(await user._id, await user.emailVerificationToken)
  const loginResponse = await login(server)({
    emailOrUserName: signupData.email,
    password: signupData.password,
  })
  return {
    user: await loginResponse.body.user,
    token: await loginResponse.body.token
  }
}
