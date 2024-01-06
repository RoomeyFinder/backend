const { v2: cloudinary } = require("cloudinary")
const DatauriParser = require("datauri/parser")
const CustomError = require("../utils/error")
const parser = new DatauriParser()
cloudinary.config({
  cloud_name: process.env.CLOUDNARY_NAME,
  api_key: process.env.CLOUDNARY_API_KEY,
  api_secret: process.env.CLOUDNARY_API_SECRET,
})
module.exports = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next()
  if(process.env.NODE_ENV === "test"){
    const done = req.files.map(file => {
      let img = ({
        asset_id: file.mimetype, 
        public_id: file.mimetype, 
        width: 100, height: 100, 
        secure_url: file.mimetype, 
        etag: file.mimetype, 
        created_at: new Date(Date.now()),
      })
      return img
    })
    if (req.imagesPath) req.body[req.imagesPath] = done
    return next()
  }
  const done = await Promise.allSettled(
      req.files.map(async (file) => {
      if (file) {
        const fileExt = `.${file.mimetype.split("/")[1]}`
        const formatted = parser.format(fileExt, file.buffer)
        let response
        try {
          response = await cloudinary.uploader.upload(formatted.content, {
            public_id: `${file.fieldname}_${Date.now()}`,
          })
        } catch (err) {
          process.env.NODE_ENV !== "test" && console.log(err.message)
          next(new CustomError(err.message), 500)
        }
        if (!response) {
          return next(new CustomError("Something went wrong!", 500))
        }
        if(req.imagesPath === undefined)
          req.body[file.fieldname] = response.secure_url
        const { asset_id, public_id, width, height,secure_url, etag, created_at } = response
        return {
          asset_id, public_id, width, height, secure_url, etag, created_at
        }
      }
    })
  )
  if (done.length !== req.files.length)
    return next(new CustomError("Unable to upload some files!", 500))
  req.body[req.imagesPath] = done.map(it => it.value)
  next()
}
