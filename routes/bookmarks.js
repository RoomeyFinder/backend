const express = require('express');
const { protectRoute } = require("../middlewares/auth");
const { sendResponse } = require("../utils/routes");
const { getMultipleBookmarks, createBookmark, getBookmark, deleteBookmark } = require("../route-handlers/bookmark");
const router = express.Router();

router.get("/",  protectRoute, getMultipleBookmarks, sendResponse)
router.post("/", protectRoute, createBookmark, sendResponse)
router.get("/:id", protectRoute, getBookmark, sendResponse)
router.delete("/:id", protectRoute, deleteBookmark, sendResponse)

module.exports = router