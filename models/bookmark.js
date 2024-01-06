const mongoose = require("mongoose")

const bookmarkSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Types.ObjectId,
      required: [true, "Owner id is required!"],
      ref: 'User'
    },
    doc: {
      type: mongoose.Types.ObjectId,
      required: [true, "Bookmark reference is required!"],
      refPath: "type"
    },
    type: {
      type: String,
      required: [true, "Type of bookmark is required!"],
      enum: ["User", "Listing"]
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

const Bookmark = mongoose.model("bookmark", bookmarkSchema)

module.exports = Bookmark
