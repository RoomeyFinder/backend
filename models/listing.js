const mongoose = require("mongoose")
const Interest = require("./interest")

const requiredPaths = [
  {
    path: "lookingFor",
    errorMsg: "Please specify the description of your ideal roommate",
  },
  {
    path: "photos",
    errorMsg: "A minimum of 3 photos and a maximum of 10",
  },
  {
    path: "location.type",
    errorMsg: "Invalid location",
  },
  {
    path: "location.coordinates",
    errorMsg: "Invalid location",
  },
  {
    path: "streetAddress",
    errorMsg: "street addresss must be provided",
  },
  {
    path: "city",
    errorMsg: "city must be provided",
  },
  {
    path: "country",
    errorMsg: "country must be provided",
  },
  {
    path: "rentAmount",
    errorMsg: "Please specify the rent amount",
  },
  {
    path: "rentDuration",
    errorMsg: "Please specify the rent duration",
  },
  {
    path: "currentOccupancyCount",
    errorMsg: "Please specify current number of occupants",
  },
  {
    path: "description",
    errorMsg: "Please add a description",
  },
]
const listingSchema = new mongoose.Schema(
  {
    lookingFor: {
      type: String,
      maxlength: 120,
    },
    photos: {
      type: [
        {
          asset_id: String,
          public_id: String,
          width: Number,
          height: Number,
          secure_url: String,
          etag: String,
          created_at: Date,
        },
      ],
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
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
    },
    streetAddress: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    rentAmount: {
      type: Number,
    },
    rentDuration: {
      type: String,
      enum: ["annually", "biannually", "quarterly", "monthly", ""],
    },
    currentOccupancyCount: {
      type: Number,
    },
    description: {
      type: String,
      maxlength: 1000,
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
      type: [{ value: String, category: String }],
      validate: [(value) => value.length <= 20, "A maximum of 20 features"],
    },
    isActivated: {
      type: Boolean,
      default: false,
    },
    isDraft: {
      type: Boolean,
      default: true,
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

listingSchema.virtual("unseenInterestsRecieved").get(async function () {
  return await Interest.countDocuments({
    doc: this._id,
    type: "Listing",
    seen: false,
  })
})

listingSchema.path("numberOfBedrooms").required(function () {
  return this.isStudioApartment === false && this.isDraft === false
}, "Please specify the number of bedrooms")

listingSchema.path("photos").validate(function (value) {
  if (this.isDraft === true) return value.length <= 10
  return value.length >= 3 && value.length <= 10
}, "A minimum of 3 photos and a maximum of 10")

listingSchema.pre(/^find/, function (next) {
  this.populate({
    path: "owner",
    model: "User",
    select:
      "isStudent isIdVerified school occupation gender firstName lastName",
  })

  next()
})

requiredPaths.forEach((path) => {
  listingSchema.path(path.path).required(function () {
    return this.isDraft === false
  }, path.errorMsg)
})

const Listing = mongoose.model("Listing", listingSchema)

module.exports = Listing
