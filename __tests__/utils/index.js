const request = require("supertest")
const path = require("path")


module.exports.sendMultipartBodyRequest = async (server, method, route, data, token) => {
  if (data.photos) {
    const requestObj =
      request(server)[method](route)
        .set("Authorization", token ? `Bearer ${token}` : "")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
    Object.keys(data).forEach(key => {
      if (Array.isArray(data[key])) {
        for (let idx = 0;idx < data[key].length;idx++) {
          const value = data[key][idx];
          if (value !== path.basename(value))
            requestObj.attach(key, value)
          else requestObj.field(key, value)
        }
      } else requestObj.field(key, data[key])
    })
    return await requestObj
  } else {
    return await request(server)[method](route)
      .send(data)
      .set("Authorization", token ? `Bearer ${token}` : "")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
  }
}

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
