var express = require('express');
const { protectRoute } = require("../middlewares/auth");
const { getMultipleUsers, signup, verifyEmail, login, updateUser, getUser, deleteAccount } = require("../route-handlers/user");
const { sendResponse } = require("../utils/routes");
var router = express.Router();

router.post("/", signup, sendResponse)
router.get("/verify-email/:id/:emailVerificationToken", verifyEmail, sendResponse)
router.post("/login", login, sendResponse)
router.get("/", protectRoute, getMultipleUsers, sendResponse)
router.put("/:id", protectRoute, updateUser, sendResponse)
router.get("/:id", protectRoute, getUser, sendResponse)
router.delete("/:id", protectRoute, deleteAccount, sendResponse)

module.exports = router