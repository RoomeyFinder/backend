const mongoose = require("mongoose")
const { EmailSender } = require("../services/email")

const feedbackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
    },
    message: {
      type: String,
      required: [true, "Please provide a message"],
      trim: true,
      minLength: [10, "Your message should be at least 10 charaters long."],
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    timestamps: true,
  }
)

feedbackSchema.methods.mailToManagement = async function () {
  const mailOptions = {
    from: this.email,
    to: "exploitenomah@gmail.com",
    subject: "A new feedback",
    html: await EmailSender.generateEmailBody({
      name: "",
      intro: `A new feedback from ${this.name}`,
      action: {
        instructions: this.message,
        button: {
          text: ""
        }
      },
      outro: `Email provided was ${this.email}`,
    }),
  }
  await EmailSender.sendEmail(mailOptions)
}
const Feedback = mongoose.model("Feedback", feedbackSchema)
module.exports = Feedback
