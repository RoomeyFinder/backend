const express = require('express');
const { protectRoute } = require("../middlewares/auth");
const { getMultipleUsers, signup, verifyEmail, login, updateUser, getUser, deactivateUser, completeSignup, resendEmailVerificationCode, validatePassword, changePassword, toggleProfileVisiblity, requestEmailChange, confirmEmailChange } = require("../route-handlers/user");
const { sendResponse, attachImagesPathToReq } = require("../utils/routes");
const { multerUpload } = require("../middlewares/multer");
const getImageUrl = require("../middlewares/cloudinary");
const router = express.Router();

router.post("/", signup, sendResponse)
router.post("/verify-email/:emailVerificationCode", verifyEmail, sendResponse)
router.post("/verify-email", resendEmailVerificationCode, sendResponse)
router.put("/verify-email/:emailVerificationCode", completeSignup, sendResponse)
router.post("/login", login, sendResponse)
router.post("/change-password", protectRoute, validatePassword, changePassword, sendResponse)
router.post("/request-email-change", protectRoute, requestEmailChange, sendResponse)
router.post("/confirm-email-change", protectRoute, confirmEmailChange, sendResponse)
router.get("/", getMultipleUsers, sendResponse)
router.get("/me", protectRoute, getUser, sendResponse)
router.put(
  "/me/toggle-visibility",
  protectRoute,
  toggleProfileVisiblity,
  sendResponse,
)
router.put("/:id", attachImagesPathToReq("newPhotos"), protectRoute, multerUpload.any(), getImageUrl, protectRoute, updateUser, sendResponse)
router.get("/:id", protectRoute, getUser, sendResponse)
router.delete("/:id", protectRoute, deactivateUser, sendResponse)

module.exports = router