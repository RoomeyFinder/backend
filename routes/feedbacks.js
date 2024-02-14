
const express = require("express")
const { handlePost } = require("../route-handlers/feedback")
const router = express.Router()


router.post("/", handlePost)

module.exports = router