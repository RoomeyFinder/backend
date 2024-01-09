var express = require('express');
const { protectRoute } = require("../middlewares/auth");
const { getMultipleUsers, signup, verifyEmail, login, updateUser, getUser, deleteAccount } = require("../route-handlers/user");
const { sendResponse, attachImagesPathToReq } = require("../utils/routes");
const { multerUpload } = require("../middlewares/multer");
const getImageUrl = require("../middlewares/cloudinary");
var router = express.Router();

router.post("/", signup, sendResponse)
router.get("/verify-email/:id/:emailVerificationToken", verifyEmail, sendResponse)
router.post("/login", login, sendResponse)
router.get("/", protectRoute, getMultipleUsers, sendResponse)
router.put("/:id", attachImagesPathToReq("photos"), protectRoute, multerUpload.any(), getImageUrl, protectRoute, updateUser, sendResponse)
router.get("/:id", protectRoute, getUser, sendResponse)
router.delete("/:id", protectRoute, deleteAccount, sendResponse)

module.exports = router