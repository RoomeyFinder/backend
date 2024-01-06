const request = require("supertest")
const path = require("path")


module.exports.sendEmptyBodyRequest = async (server, method, route, token) => {
  return await request(server)
  [method](route)
    .set("Authorization", token ? `Bearer ${token}` : "")
    .set("Accept", "application/json")
    .expect("Content-Type", /json/)
}

module.exports.sendRequestWithBody = async (server, method, route, body, token) => {
  return await request(server)
  [method](route)
    .send(body)
    .set("Accept", "application/json")
    .set("Authorization", token ? `Bearer ${token}` : "")
    .expect("Content-Type", /json/)
}

module.exports.getPhotos = function(photosCount) {
  let i = 1
  let photos = []
  while (i <= photosCount) {
    photos.push(path.resolve(__dirname, `../seeds/images/photo-1.png`))
    i++
  }
  return photos
}
