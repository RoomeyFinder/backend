const mongoose = require("mongoose")

const interestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Types.ObjectId,
      required: [true, "Sender id is required!"],
      ref: 'User'
    },
    doc: {
      type: mongoose.Types.ObjectId,
      required: [true, "Interest reference is required!"],
      refPath: "type"
    },
    type: {
      type: String,
      required: [true, "Type of interest is required!"],
      enum: ["User", "Listing"]
    },
    seen: {
      type: Boolean,
      default: false
    },
    accepted: {
      type: Boolean,
      default: false
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

const Interest = mongoose.model("Interest", interestSchema)

module.exports = Interest
