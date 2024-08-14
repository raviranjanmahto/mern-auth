const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { sendCookieToken } = require("../utils/cookieToken");
const sendResponse = require("../utils/sendResponse");

exports.signup = catchAsync(async (req, res, next) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password)
    return next(new AppError("All fields are required!", 400));

  const exUser = await User.findOne({ email });
  if (exUser) return next(new AppError("User already exists", 400));

  // Create a new user instance
  const user = new User({ name, email, password });

  // Generate and hash the email verification otp using the createToken method
  const otpVerification = user.createToken("otpVerification");

  // Save the new user to the database
  await user.save();

  sendCookieToken(user, 201, res, "User created successfully");
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError("Email and password are required", 400));

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password)))
    return next(new AppError("Invalid email or password", 401));

  user.lastLogin = new Date();
  await user.save();

  sendCookieToken(user, 200, res, "Logged in successfully");
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { otpCode } = req.body;
  if (!otpCode) return next(new AppError("OTP code is required", 400));

  const hashedCode = crypto.createHash("sha256").update(otpCode).digest("hex");

  // Find the user by ID and OTP, and ensure the OTP has not expired
  const user = await User.findOne({
    _id: req.user._id, // Ensure the OTP is tied to the authenticated user
    otp: hashedCode,
    otpExpiresAt: { $gt: Date.now() },
  });
  if (!user) return next(new AppError("OTP code is invalid or expired", 400));

  // Mark user as verified and clear verification fields
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  // Send response indicating success
  sendResponse(null, 200, res, "Email verification successful");
});

exports.currentUser = catchAsync(async (req, res, next) => {
  sendResponse(req.user, 200, res, "Current user fetched successfully");
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const { name, email } = req.body;
  if (!name && !email)
    return next(new AppError("At least one field is required", 400));

  if (name) req.user.name = name;
  if (email) req.user.email = email;
  const user = await req.user.save();
  sendResponse(user, 200, res, "Profile updated successfully");
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  if (!email) return next(new AppError("Email is required", 400));

  const user = await User.findOne({ email });
  if (!user) return next(new AppError("No user found with that email!", 404));

  // Generate a reset token and expiration date
  const resetToken = user.createToken("resetPassword");

  await user.save({ validateBeforeSave: false }); // Skip validation to avoid issues during save

  // Send email with reset link
  sendResponse(null, 200, res, "Password reset link sent successfully");
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const password = req.body.password;
  const token = req.params.token;
  if (!password) return next(new AppError("Password are required", 400));

  // Hash the token for comparison
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find user with the hashed token and check if token is still valid
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiresAt: { $gt: Date.now() },
  });
  if (!user)
    return next(new AppError("Invalid reset link or has expired", 400));

  // Set new password and clear reset token
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiresAt = undefined;
  await user.save();

  sendResponse(user, 200, res, "Password reset successful");
});

exports.logout = catchAsync(async (req, res, next) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Make sure this matches how the cookie was set
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Match this with how the cookie was set
  });

  sendResponse(null, 200, res, "Logged out successfully");
});

exports.protect = catchAsync(async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return next(new AppError("Please login to get access", 401));

  // Verify the token and decode it to get user data
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Check if the user is still active and not deleted
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError("User no longer exists. Please log in again.", 401)
    );

  // Check if the user changed password after the token was issued
  if (currentUser.changePasswordAfter(decoded.iat))
    return next(
      new AppError("User changed password recently. Please log in again", 401)
    );

  // Attach the user to the request object for further use
  req.user = currentUser;
  next();
});
