const mongoose = require("mongoose")
const Interest = require("./interest")

const listingSchema = new mongoose.Schema(
  {
    idealRoommateDescription: {
      type: String,
      required: [true, "Please specify the description of your ideal roommate"],
      maxlength: 120,
    },
    photos: {
      type: [{
        asset_id: String,
        public_id: String,
        width: Number,
        height: Number,
        secure_url: String,
        etag: String,
        created_at: Date
      }],
      validate: [(value) => value.length >= 3 && value.length <= 10, "A minimum of 3 photos and a maximum of 10"],
      required: [true, "Photos must be provided"]
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
    streetAddress: {
      type: String,
      required: [true, "street addresss must be provided!"]
    },
    city: {
      type: String,
      required: [true, "street addresss must be provided!"]
    },
    state: {
      type: String,
      required: [true, "street addresss must be provided!"]
    },
    country: {
      type: String,
      required: [true, "street addresss must be provided!"]
    },
    rentAmount: {
      type: Number,
      required: [true, "Please specify the rent amount"],
    },
    rentDuration: {
      type: String,
      enum: ["annually", "biannually", "quarterly", "monthly"],
      required: [true, "Please specify the rent duration!"]
    },
    currentOccupancyCount: {
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
    features: {
      type: [String],
      // enum: [],
      validate: [(value) => value.length <= 20, "A maximum of 20 features"],
    },
    isActive: {
      type: Boolean,
      default: true,

    }
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

listingSchema.virtual("unseenInterestsRecieved").get(async function () {
  return await Interest.countDocuments({ doc: this._id, type: "Listing", seen: false })
})

listingSchema.path("numberOfBedrooms").required(function () {
  return this.isStudioApartment === false
}, "Please specify the number of bedrooms")

const Listing = mongoose.model("Listing", listingSchema)

module.exports = Listing
