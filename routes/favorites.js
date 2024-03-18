const express = require('express');
const { protectRoute } = require("../middlewares/auth");
const { sendResponse } = require("../utils/routes");
const { getMultipleFavorites, createFavorite, getFavorite, deleteFavorite } = require("../route-handlers/favorite");
const router = express.Router();

router.get("/me",  protectRoute, getMultipleFavorites, sendResponse)
router.post("/me", protectRoute, createFavorite, sendResponse)
router.get("/:id", protectRoute, getFavorite, sendResponse)
router.delete("/:id", protectRoute, deleteFavorite, sendResponse)

module.exports = router