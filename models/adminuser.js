const mongoose = require("mongoose")
const CustomError = require("../utils/error")
const { generateFromEmail } = require("unique-username-generator");
const bcrypt = require("bcryptjs");

const adminUserSchema = new mongoose.Schema(
  {
    userName: String,
    photo: {
      type: {
        asset_id: String,
        public_id: String,
        width: Number,
        height: Number,
        secure_url: String,
        etag: String,
        created_at: Date
      },
    },
    firstName: String,
    lastName: String,
    email: {
      type: String,
      required: [true, "Email is required"]
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["omnipotent", "admin"],
      default: "admin"
    },
    lastSeen: {
      type: Date,
      default: new Date(Date.now())
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
    validateBeforeSave: true
  }
)

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
      this.password = bcrypt.hash(this.password, salt);
    }
  }
  next()
})

const AdminUser = mongoose.model("AdminUser", adminUserSchema)

module.exports = AdminUser
