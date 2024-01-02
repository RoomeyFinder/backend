var express = require('express');
const { protectRoute } = require("../middlewares/auth");
const { createListing, updateListing, deleteListing, getListing, getMultipleListings } = require("../route-handlers/listing");
const { sendResponse } = require("../utils/routes");
var router = express.Router();

router.get("/",  protectRoute, getMultipleListings, sendResponse)
router.post("/", protectRoute, createListing, sendResponse)
router.get("/:id", protectRoute, getListing, sendResponse)
router.put("/:id", protectRoute, updateListing, sendResponse)
router.delete("/:id", protectRoute, deleteListing, sendResponse)

module.exports = router