const express = require('express');
const { protectRoute } = require("../middlewares/auth");
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
const { sendResponse } = require("../utils/routes");
const { multerUpload } = require("../middlewares/multer");
const getImageUrl = require("../middlewares/cloudinary");
const { validateListingCreationRequest } = require("../middlewares/listing");
const router = express.Router();

router.get("/",  protectRoute, getMultipleListings, sendResponse)
router.get("/me",  protectRoute, getUsersListings, sendResponse)
router.post("/", protectRoute, multerUpload.any(), validateListingCreationRequest, getImageUrl, createListing, sendResponse)
router.get("/:id", getListing, sendResponse)
router.put("/:id", protectRoute, multerUpload.any(), getImageUrl, protectRoute, updateListing, sendResponse)
router.put("/:id/activate", protectRoute, activateListing, sendResponse)
router.put("/:id/deactivate", protectRoute, deactivateListing, sendResponse)
router.delete("/:id", protectRoute, deleteListing, sendResponse)

module.exports = router