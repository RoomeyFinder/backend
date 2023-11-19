const mongoose = require("mongoose")

const planSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["weekly", "monthly"],
    required: [true, "Please specify plan type"],
  },
  price: {
    type: Number,
    required: [true, "The plan price must be included"],
  },
  features: {
    type: [String],
    required: [true, "The plan features must be included!"],
    enum: ["IdVerification", "profileViews", "boostCredits"],
  },
})

const subscriptionSchema = new mongoose.Schema(
  {
    subscription: {
      plan: {
        type: planSchema,
        required: [true, "The plan type must be specified."],
      },
      start: {
        type: Date,
      },
      autoRenew: {
        type: Boolean,
        default: false,
      },
      isExpired: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    tiemstamps: true,
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  }
)

const Subscription = mongoose.model("Subscription", subscriptionSchema)

module.exports = Subscription
