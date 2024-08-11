const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please tell us your email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      required: [true, "Password is required!"],
      select: false,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    otp: String,
    otpExpiresAt: Date,
  },
  { timestamps: true }
);

// Pre-save middleware to hash the password before saving
userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 11
  this.password = await bcrypt.hash(this.password, 11);

  if (this.isModified("password") && !this.isNew)
    this.passwordChangeAt = Date.now() - 1000; // Ensure the token is created after this time

  next();
});

// Method to compare password during login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Only find active users
userSchema.pre(/^find/, async function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// Method to check if the token is valid
userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangeAt)
    return JWTTimestamp < this.passwordChangeAt.getTime() / 1000;

  // False means no change
  return false;
};

userSchema.methods.createToken = function (type, next) {
  let token;
  let hashedToken;

  if (type === "passwordReset") {
    // Generate a random token for password reset
    token = crypto.randomBytes(32).toString("hex");
    hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Set token and expiry for password reset
    this.passwordResetToken = hashedToken;
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Token expires in 10
  } else if (type === "otpVerification") {
    // Generate a 6-digit code for email verification
    token = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the 6-digit code
    hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Set token and expiry for email verification
    this.otp = hashedToken;
    this.otpExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // Token expires in 24 hours
  }

  return token;
};

// Virtual to hide certain fields when converting to JSON
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.isActive;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpiresAt;
  delete userObject.otp;
  delete userObject.otpExpiresAt;
  delete userObject.__v;
  return userObject;
};

module.exports = mongoose.model("User", userSchema);
