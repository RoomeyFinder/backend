const express = require("express")
const { protectRoute } = require("../middlewares/auth")
const {
  createListing,
  updateListing,
  deleteListing,
  getListing,
  getMultipleListings,
  getUsersListings,
  activateListing,
  deactivateListing,
} = require("../route-handlers/listing")
const { sendResponse, attachImagesPathToReq } = require("../utils/routes")
const { multerUpload } = require("../middlewares/multer")
const getImageUrl = require("../middlewares/cloudinary")
const {
  validateListingCreationRequest,
  validateListingUpdateRequest,
} = require("../middlewares/listing")
const router = express.Router()

router.get("/", getMultipleListings, sendResponse)
router.get("/me", protectRoute, getUsersListings, sendResponse)
router.post(
  "/",
  protectRoute,
  attachImagesPathToReq("photos"),
  multerUpload.any(),
  validateListingCreationRequest,
  getImageUrl,
  createListing,
  sendResponse
)
router.get("/:id", getListing, sendResponse)
router.put(
  "/:id",
  protectRoute,
  attachImagesPathToReq("photos"),
  multerUpload.any(),
  getImageUrl,
  protectRoute,
  validateListingUpdateRequest,
  updateListing,
  sendResponse
)
router.put("/:id/activate", protectRoute, activateListing, sendResponse)
router.put("/:id/deactivate", protectRoute, deactivateListing, sendResponse)
router.delete("/:id", protectRoute, deleteListing, sendResponse)

module.exports = router
