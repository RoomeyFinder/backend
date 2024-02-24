const mongoose = require("mongoose")
const CustomError = require("../utils/error")
const { generateFromEmail } = require("unique-username-generator")
const bcrypt = require("bcryptjs")
const Interest = require("./interest")
const { EmailSender } = require("../services/email")
const { generateRandomSixDigitToken } = require("../utils")

const Image = new mongoose.Schema({
  asset_id: String,
  public_id: String,
  width: Number,
  height: Number,
  secure_url: String,
  etag: String,
  created_at: Date,
})

const userSchema = new mongoose.Schema(
  {
    profileImage: Image,
    photos: {
      type: [Image],
      validate: [
        (value) => value.length <= 10,
        "A minimum of 3 photos and a maximum of 10",
      ],
    },
    countOfInterestsLeft: {
      type: Number,
      default: 20,
    },
    isIdVerified: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneNumberVerified: Boolean,
    emailVerificationCode: String,
    emailVerificationCodeExpiry: Date,
    passwordResetToken: String,
    passwordResetCodeExpiry: Date,
    passwordResetCode: String,
    firstName: {
      type: String,
      required: [true, "First name is required"],
      lowercase: true,
      trim: true,
      minlength: 4,
      maxlength: 15,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      lowercase: true,
      trim: true,
      minlength: 4,
      maxlength: 15,
    },
    userName: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    dob: {
      type: Date,
      required: [true, "Birthday is required"],
      validate: {
        validator: function (value) {
          const dob = new Date(value)
          return new Date(Date.now()).getFullYear() - dob.getFullYear() >= 14
        },
        message: "You must be above 14 years of age!",
      },
    },
    about: {
      type: String,
      maxlength: 250,
      default: "",
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      validate: [
        (value) => isNaN(Number(value)) === false,
        "Invalid phone number",
      ],
    },
    countryCode: {
      type: Number,
      required: [true, "Country code is required"],
    },
    stateOfOrigin: {
      type: String,
    },
    countryOfOrigin: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: [true, "Gender is required!"],
    },
    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
    },
    currentAddress: String,
    hasPets: Boolean,
    pets: {
      type: [String],
      default: [],
    },
    hasAllergies: Boolean,
    allergies: {
      type: [String],
      default: [],
    },
    budget: Number,
    occupation: {
      type: String,
      default: "",
    },
    organization: String,
    isStudent: Boolean,
    school: String,
    major: String,
    lifestyleTags: {
      type: [{ value: String, category: String }],
      validate: [
        (value) => value.length <= 10,
        "A maximum of 10 lifestyle tags",
      ],
      default: [],
    },
    earliestMoveDate: Date,
    targetLocation: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
    },
    targetCity: String,
    targetState: String,
    lookingFor: {
      type: String,
      enum: ["room", "roommate"],
    },
    isProfileComplete: Boolean,
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "dark",
    },
    lastSeen: {
      type: Date,
      default: new Date(Date.now()),
    },
    zipcode: String,
  },
  {
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
    timestamps: true,
    validateBeforeSave: true,
  }
)
userSchema.virtual("unseenInterestsReceived")

userSchema.pre("save", function (next) {
  if (!this.userName || this.userName?.length === 0) {
    this.userName = generateFromEmail(this.email, 3)
  }
  next()
})

userSchema.methods.updateLastSeen = async function () {
  this.lastSeen = new Date(Date.now())
  await this.save()
}

userSchema.post(/^find/, async function (doc, next) {
  if (doc)
    doc.unseenInterestsReceived = await Interest.countDocuments({
      doc: this._id,
      type: "User",
      seen: false,
    })
  next()
})
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    if (
      this.password.includes(this.firstName) ||
      this.password.includes(this.lastName)
    )
      return next(
        new CustomError(
          "Your password cannot contain your first name or last name",
          400
        )
      )
    else {
      const salt = await bcrypt.genSalt(10)
      this.password = await bcrypt.hash(this.password, salt)
    }
  }
  next()
})

userSchema.pre("save", function (next) {
  if (this.isStudent) {
    const schoolError = this.school?.length === 0 && "Please specify school"
    const majorError = this.major?.length === 0 && "Please specify major"
    if (schoolError || majorError)
      return next(
        new CustomError(`${schoolError || ""}\n ${majorError || ""}`),
        400
      )
  }
  return next()
})

userSchema.pre("save", function (next) {
  this.isProfileComplete =
    this.about?.length > 0 &&
    this.stateOfOrigin?.length > 0 &&
    this.countryOfOrigin?.length > 0 &&
    ((this.hasPets && this.pets?.length > 0) || !this.hasPets) &&
    ((this.hasAllergies && this.allergies?.length > 0) || !this.hasAllergies) &&
    this.budget &&
    ((!this.isStudent && this.occupation && this.organization) ||
      (this.isStudent && this.school && this.major)) &&
    this.earliestMoveDate &&
    this.lookingFor &&
    this.phoneNumber &&
    this.countryCode &&
    this.isEmailVerified &&
    this.photos?.length >= 1
      ? true
      : false
  return next()
})

userSchema.methods.generateEmailVerificationCode = async function () {
  const expiry = new Date(Date.now())
  expiry.setHours(expiry.getHours() + 48)
  this.emailVerificationCode = generateRandomSixDigitToken()
  this.emailVerificationCodeExpiry = expiry
  return await this.save()
}
userSchema.methods.generatePasswordResetCode = async function () {
  const expiry = new Date(Date.now())
  expiry.setMinutes(expiry.getMinutes() + 15)
  this.passwordResetCode = generateRandomSixDigitToken()
  this.passwordResetCodeExpiry = expiry
  return await this.save()
}

userSchema.methods.sendVerificationEmail = async function () {
  const options = {
    from: process.env.APP_EMAIL_ADDRESS,
    to: this.email,
    subject: "Please verify your email",
    html: EmailSender.generateEmailBody({
      name: `${this.firstName}`,
      intro: "Please verify your email",
      action: {
        instructions: "Use the six digit code to verify your email",
        button: {
          text: this.emailVerificationCode,
        },
      },
      outro: "Welcome to RoomeyFinder",
    }),
  }
  let isSuccess = false
  try {
    isSuccess = EmailSender.sendEmail(options)
  } catch (err) {
    process.env.NODE_ENV !== "test" && console.log(err)
    console.log("failed to send email")
    isSuccess = false
  }
  return isSuccess
}


userSchema.methods.sendPasswordResetEmail = async function () {
  const options = {
    from: process.env.APP_EMAIL_ADDRESS,
    to: this.email,
    subject: "Please verify your email",
    html: EmailSender.generateEmailBody({
      name: `${this.firstName}`,
      intro: "You requested a password reset",
      action: {
        instructions: "Use the six digit code to reset your password",
        button: {
          text: this.passwordResetCode,
        },
      },
      outro: "",
    }),
  }
  let isSuccess = false
  try {
    isSuccess = EmailSender.sendEmail(options)
  } catch (err) {
    process.env.NODE_ENV !== "test" && console.log(err)
    console.log("failed to send email")
    isSuccess = false
  }
  return isSuccess
}

const User = mongoose.model("User", userSchema)

module.exports = User
