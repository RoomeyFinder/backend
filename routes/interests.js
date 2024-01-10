const express = require('express');
const { protectRoute } = require("../middlewares/auth");
const { sendResponse } = require("../utils/routes");
const { getMultipleInterests, createInterest, getInterest, updateInterest, deleteInterest } = require("../route-handlers/interest");
const router = express.Router();

router.get("/", protectRoute, getMultipleInterests, sendResponse)
router.post("/", protectRoute, createInterest, sendResponse)
router.get("/user", protectRoute, getMultipleInterests, sendResponse)
router.put("/:id", protectRoute, updateInterest, sendResponse)
router.get("/:id", protectRoute, getInterest, sendResponse)
router.delete("/:id", protectRoute, deleteInterest, sendResponse)

module.exports = router