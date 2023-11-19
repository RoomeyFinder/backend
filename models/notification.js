const mongoose = require("mongoose")

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["message", "listing-view", "profile-view", "listing-interest"],
    },
    title: {
      type: String,
      required: [true, "Notification title is required"],
    },
    body: {
      type: String,
      required: [true, "Notification body is required"],
    },
    data: {
      title: {
        type: String,
        required: [true, "Notification data title is required"],
      },
      content: {
        type: String,
        required: [true, "Notification data content is required"],
      },
      timestamp: {
        type: Date,
        required: [true, "Notification timestamp is required"],
      },
      actionURL: {
        type: String,
        required: [true, 'Notification data action URL is required']
      }
    },
    actionUrl: {
      type: String,
      required: [true, "Action URL is required"],
    },
    icon: {
      type: String,
      default: "",
    },
    sound: {
      type: String,
      default: "default",
    },
    badge: {
      type: Number,
      default: 1,
    },
    priority: "high",
    ttl: 3600,
    target: {
      type: mongoose.types.ObjectId,
      required: [true, "Target id must be specified"],
      ref: "User",
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

const Notification = mongoose.model("notification", notificationSchema)

module.exports = Notification
