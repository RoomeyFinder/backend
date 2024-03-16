const Listing = require("../models/listing")
const Purchase = require("../models/purchase")
const CustomError = require("../utils/error")
const { routeTryCatcher } = require("../utils/routes")

module.exports.validateListingCreationRequest = routeTryCatcher(
  async (req, res, next) => {
    const canCreateListing =
      req.body.isDraft === "true" ||
      req.body.isDraft === true ||
      (await Listing.findOne({ owner: req.user._id, isActivated: true })) ===
        null ||
      (await Purchase.findOne({
        owner: req.user._id,
        validUntil: { $gt: new Date(Date.now()) },
      })) !== null
    if (req.body.isDraft)
      if (!canCreateListing && req.body.isDraft !== true)
        return next(
          new CustomError(
            "You already have an active listing! Deactivate or delete it to create a new active listing",
            400
          )
        )
    next()
  }
)

module.exports.validateListingUpdateRequest = routeTryCatcher(
  async (req, res, next) => {
    const canUpdateListing =
      (await Listing.findOne({
        owner: req.user._id,
        isActivated: true,
        _id: { $ne: req.params.id },
      })) === null ||
      (await Purchase.findOne({
        owner: req.user._id,
        validUntil: { $gt: new Date(Date.now()) },
      })) !== null
    if (
      !canUpdateListing &&
      (req.body.isDraft === "false" || req.body.isDraft === false)
    )
      return next(
        new CustomError(
          "You already have an active listing! Deactivate or delete it to activate this listing",
          400
        )
      )
    next()
  }
)
