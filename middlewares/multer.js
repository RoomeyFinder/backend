const multer = require("multer")

module.exports.multerUpload = multer({
  limits: {
    fileSize: 5000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpeg|jpg|gif|webp)$/)) {
      return cb(
        new Error(`File type ${file.originalname.match(
          /\.(png|jpeg|jpg|gif|webp)$/
        )} not allowed! 
      Please upload any of these types: png, jpeg, jpg, gif, webp.`)
      )
    }
    cb(undefined, true)
  },
})
