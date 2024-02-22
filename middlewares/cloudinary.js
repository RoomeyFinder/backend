const DatauriParser = require("datauri/parser")
const cloudinary = require("../utils/cloudinary")

const parser = new DatauriParser()

module.exports = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next()
  if (process.env.NODE_ENV === "test") {
    const done = req.files.map((file) => {
      let img = {
        asset_id: file.mimetype,
        public_id: file.mimetype,
        width: 100,
        height: 100,
        secure_url: file.mimetype,
        etag: file.mimetype,
        created_at: new Date(Date.now()),
      }
      return img
    })
    if (req.imagesPath) req.body[req.imagesPath] = done
    return next()
  }
  req.files = await Promise.allSettled(
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
          return null
        }
        if (!response) return null

        // req.body[file.fieldname] = response
        console.log(
          file.fieldname
          // req.body[file.fieldname],
        )
        response.fieldname = file.fieldname
        return response
      }
    })
  )
  const reducedByFields = req.files.reduce((acc, curr) => {
    const fieldName = curr.value.fieldname
    if (acc[fieldName]) acc[fieldName].push(curr.value)
    else acc[fieldName] = [curr.value]
    return acc
  }, {})
  req.body = { ...req.body, ...reducedByFields }
  next()
}
