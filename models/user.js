const mongoose = require("mongoose")
const CustomError = require("../utils/error")
const { generateFromEmail } = require("unique-username-generator");
const bcrypt = require("bcryptjs");
const Interest = require("./interest")

const userSchema = new mongoose.Schema(
  {
    photos: {
      type: [{
        asset_id: String,
        public_id: String,
        width: Number,
        height: Number,
        secure_url: String,
        etag: String,
        created_at: Date
      }],
      validate: [(value) => value.length <= 10, "A minimum of 3 photos and a maximum of 10"],
    },
    countOfInterestsLeft: {
      type: Number,
      default: 20
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
        message: "You must be above 14 years of age!"
      }
    },
    about: {
      type: String,
      maxlength: 250,
      default: "",
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
    },
    countryCode: {
      type: Number,
      required: [true, "Country code is required"]
    },
    stateOfOrigin: {
      type: String,
    },
    countryOfOrigin: {
      type: String
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
    currentCity: String,
    currentState: String,
    hasPets: Boolean,
    pets: {
      type: [String],
      default: []
    },
    hasAllergies: Boolean,
    allergies: {
      type: [String],
      default: []
    },
    budget: Number,
    jobTitle: String,
    organization: String,
    isStudent: Boolean,
    school: String,
    major: String,
    tags: {
      type: [String],
      enum: [],
      validate: [(value) => value.length <= 20, "A maximum of 20 tags"],
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
      default: new Date(Date.now())
    },
    zipcode: String
  },
  {
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
    timestamps: true,
    validateBeforeSave: true
  }
)
userSchema.virtual("unseenInterestsReceived")

userSchema.pre("save", function (next) {
  if (!this.userName || this.userName.length === 0) {
    this.userName = generateFromEmail(this.email, 3)
  }
  next()
})

userSchema.methods.updateLastSeen = async function(){
  this.lastSeen = new Date(Date.now())
  await this.save()
}

userSchema.post(/^find/, async function(doc, next){
  if(doc) doc.unseenInterestsReceived = await Interest.countDocuments({ doc: this._id, type: "User", seen: false, })
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
          "Your password cannot contain your first name or last name", 400
        )
      )
    else{
      const salt = await bcrypt.genSalt(10)
      this.password = await bcrypt.hash(this.password, salt);
    }
  }
  next()
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
    this.stateOfOrigin.length > 0 &&
    this.countryOfOrigin.length > 0 &&
    ((this.hasPets && this.pets.length > 0) || !this.hasPets) &&
    ((this.hasAllergies && this.allergies.length > 0) || !this.hasAllergies) &&
    this.budget &&
    ((!this.isStudent && this.jobTitle && this.organization) ||
      (this.isStudent && this.school && this.major)) &&
    this.earliestMoveDate &&
    this.lookingFor &&
    this.phoneNumber &&
    this.countryCode &&
    this.isEmailVerified &&
    this.photos.length >= 1
     ? true : false 
  return next()
})

const User = mongoose.model("User", userSchema)

module.exports = User
