const mongoose = require("mongoose")

const purchaseSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please specify purchaser"]
    }
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

const Purchase = mongoose.model("Purchase", purchaseSchema)

module.exports = Purchase
