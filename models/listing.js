const mongoose = require("mongoose")

const listingSchema = new mongoose.Schema(
  {
    coverImage: {
      type: String,
      required: [true, "Please provide cover image"],
    },
    additionalImages: {
      type: [String],
    },
    owner: {
      type: mongoose.Types.ObjectId,
      required: [true, "Please specify the property owner"],
      ref: "User",
    },
    isStudioApartment: Boolean,
    numberOfBedrooms: Number,
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: [true, "Invalid location"],
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
        required: [true, "Invalid location"],
      },
    },
    address: {
      type: {
        streetAddress: String,
        city: String,
        state: String,
      },
    },
    rentAmount: {
      type: Number,
      required: [true, "Please specify the rent amount"],
    },
    rentDuration: {
      type: String,
      enum: ["annual", "biannual", "quarterly", "monthly"],
    },
    currentOccupantsCount: {
      type: Number,
      required: [true, "Please specify current number of occupants"],
    },
    description: {
      type: String,
      maxlength: 250,
      required: [true, "Please add a description"],
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
    timestamps: true,
  }
)

listingSchema.path("numberOfBedrooms").required(function () {
  return this.isStudioApartment === false
}, "Please specify the number of bedrooms")

const Listing = mongoose.model("Listing", listingSchema)

module.exports = Listing
