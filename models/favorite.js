const mongoose = require("mongoose")
const { capitalizeFirstLetter } = require("../utils")

const favoriteSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Types.ObjectId,
      required: [true, "Owner id is required!"],
      ref: "User",
    },
    doc: {
      type: mongoose.Types.ObjectId,
      required: [true, "Favorite reference is required!"],
      refPath: "type",
    },
    type: {
      type: String,
      required: [true, "Type of favorite is required!"],
      enum: ["User", "Listing"],
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

favoriteSchema.pre(/^find/, async function (next) {
  this.populate([
    { path: "doc" },
    { path: "owner", select: "firstName lastName profileImage" },
  ])
  next()
})

const Favorite = mongoose.model("favorite", favoriteSchema)

module.exports = Favorite
