const mongoose = require("mongoose")
const { User } = require("../models/user")

const conversationSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    participants: {
      type: [
        {
          type: mongoose.Schema.ObjectId,
          ref: "User",
        },
      ],
      validate: [
        async function (val) {
          const allAreValidUsers = [
            ...(await Promise.all(
              val.map(
                async (el) => (await User.countDocuments({ _id: el })) > 0
              )
            )),
          ].every((val) => val === true)
          const conversationWithParticipantsExists =
            await this.constructor.find({
              participants: val,
            })
          const setFromVal = new Set(val.map((el) => JSON.stringify(el)))
          return (
            setFromVal.size === val.length &&
            setFromVal.size > 1 &&
            conversationWithParticipantsExists.length === 0 &&
            allAreValidUsers
          )
        },
        "participants must be unique and greater than 1",
      ],
    },
    latestMessage: {
      type: mongoose.Schema.ObjectId,
      ref: "Message",
    },
  },
  {
    timestamps: true,
  }
)

conversationSchema.pre(/^find/, function (next) {
  if (this.options._recursed) {
    return next()
  }
  this.populate({
    path: "participants",
    options: { _recursed: true },
    select: "nickName profileImage firstName lastName",
  }).populate({ path: "latestMessage", options: { _recursed: true } })
  next()
})

conversationSchema.pre("save", async function (next) {
  await this.populate([
    {
      path: "participants",
      options: { _recursed: true },
      select: "nickName profileImage firstName lastName",
    },
    { path: "latestMessage", options: { _recursed: true } },
  ])
  next()
})

module.exports = mongoose.model("Conversation", conversationSchema)
