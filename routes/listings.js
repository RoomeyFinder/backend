var express = require('express');
const { protectRoute } = require("../middlewares/auth");
const { createListing, updateListing, deleteListing, getListing, getMultipleListings } = require("../route-handlers/listing");
const { sendResponse, attachImagesPathToReq } = require("../utils/routes");
const { multerUpload } = require("../middlewares/multer");
const getImageUrl = require("../middlewares/cloudinary");
var router = express.Router();

router.get("/",  protectRoute, getMultipleListings, sendResponse)
router.post("/", attachImagesPathToReq("photos"), protectRoute, multerUpload.any(), getImageUrl, createListing, sendResponse)
router.get("/:id", getListing, sendResponse)
router.put("/:id", attachImagesPathToReq("photos"), protectRoute, multerUpload.any(), getImageUrl, protectRoute, updateListing, sendResponse)
router.delete("/:id", protectRoute, deleteListing, sendResponse)

module.exports = router