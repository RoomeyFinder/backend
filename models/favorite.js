const mongoose = require("mongoose")

const favoriteSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Types.ObjectId,
      required: [true, "Owner id is required!"],
      ref: 'User'
    },
    doc: {
      type: mongoose.Types.ObjectId,
      required: [true, "Favorite reference is required!"],
      refPath: "type"
    },
    type: {
      type: String,
      required: [true, "Type of favorite is required!"],
      enum: ["user", "listing"]
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

const Favorite = mongoose.model("favorite", favoriteSchema)

module.exports = Favorite
