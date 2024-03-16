const DatauriParser = require("datauri/parser")
const cloudinary = require("../utils/cloudinary")

const parser = new DatauriParser()

module.exports = async function getImageUrl(req, res, next) {
  if (!req.files || req.files.length === 0) return next()
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
          process.env.NODE_ENV !== "test" && console.log(err)
          response = err
        }
        if (!response) return null
        response.fieldname = file.fieldname
        return response
      }
    })
  )
  const reducedByFields = req.files.reduce((acc, curr) => {
    const fieldName = curr.value?.fieldname
    if (!fieldName) return acc
    if (acc[fieldName]) acc[fieldName].push(curr.value)
    else acc[fieldName] = [curr.value]
    return acc
  }, {})
  req.body = { ...req.body, ...reducedByFields }
  next()
}
