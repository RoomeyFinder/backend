const mongoose = require("mongoose")
const { hashValue } = require("../utils/security")
const CustomError = require("../utils/error")

const userSchema = new mongoose.Schema(
  {
    currentSubscription: {
      type: mongoose.Types.ObjectId,
      ref: 'Plan'
    },
    isIdVerified: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: Boolean,
    isPhoneNumberVerified: Boolean,
    profileImage: {
      type: String,
      default: "",
    },
    emailVerificationToken: String,
    passwordResetToken: String,
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
    },
    about: {
      type: String,
      maxlength: 250,
      default: "",
    },
    phone: {
      type: {
        countryCode: Number,
        number: String,
      },
      required: [true, "Phone number is required"],
    },
    origin: {
      state: String,
      country: String,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: [true, "Please specify your gender"],
    },
    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        required: [true, "Invalid location"],
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
        required: [true, "Invalid location"],
      },
    },
    address: {
      type: {
        streetAddress: String,
        city: String,
        state: String,
      },
    },
    hasPets: Boolean,
    pets: [String],
    hasAllergies: Boolean,
    allergies: [String],
    budget: Number,
    jobTitle: String,
    organization: String,
    isStudent: Boolean,
    school: String,
    major: String,
    tags: {
      type: [String],
      enum: [],
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
    lookingFor: {
      type: String,
      enum: ["room", "roommate"],
    },
    isProfileComplete: Boolean,
    uiPreferences: {
      type: {
        theme: {
          type: String,
          enum: ["light", "dark"],
          default: "dark",
        },
      },
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

userSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    if (
      this.password.includes(this.firstName) ||
      this.password.includes(this.lastName)
    )
      return next(
        new CustomError(
          "Your password cannot contain your first name or last name"
        )
      )
    else this.password = hashValue(this.password)
  }
  next()
})

userSchema.pre("save", function (next) {
  const petsError =
    this.hasPets === true && this.pets.length === 0 && "Please specify pet(s)"
  const allergiesError =
    this.hasAllergies === true &&
    this.allergies.length === 0 &&
    "Please specify allergies"

  if (allergiesError || petsError)
    return next(
      new CustomError(`${allergiesError || ""}\n ${petsError || ""}`),
      400
    )
  return next()
})

userSchema.pre("save", function (next) {
  if (this.isStudent) {
    const schoolError = this.school.length === 0 && "Please specify school"
    const majorError = this.major.length === 0 && "Please specify major"
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
    this.about.length > 0 &&
    this.origin.state?.length > 0 &&
    this.origin.country?.length > 0 &&
    ((this.hasPets && this.pets.length > 0) || !this.hasPets) &&
    ((this.hasAllergies && this.allergies.length > 0) || !this.hasAllergies) &&
    this.budget &&
    ((!this.isStudent && this.jobTitle && this.organization) ||
      (this.isStudent && this.school && this.major)) &&
    this.earliestMoveDate &&
    this.targetLocation &&
    this.lookingFor

  return next()
})

const User = mongoose.model("User", userSchema)

module.exports = User
