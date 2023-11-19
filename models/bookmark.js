const mongoose = require("mongoose")

const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      required: [true, "Please specify user id"],
      ref: 'User'
    },
    listing: {
      type: mongoose.Types.ObjectId,
      required: [true, "Please specify listing id"],
      ref: 'Listing'
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

const Bookmark = mongoose.model("bookmark", bookmarkSchema)

module.exports = Bookmark
