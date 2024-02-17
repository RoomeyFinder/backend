const { createFeedback } = require("../controllers/feedback")
const { routeTryCatcher } = require("../utils/routes")

module.exports.handlePost = routeTryCatcher(async (req, res, next) => {
  const feedback = await createFeedback(req.body)
  res.status(200).json({
    feedback,
    message: "Thank you for your message! We'll get in touch shortly.",
    statusCode: 201
  })
})
