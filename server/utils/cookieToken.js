const jwt = require("jsonwebtoken");
const sendResponse = require("./sendResponse");

// Function to generate a JWT token
const signToken = (id, secret, expiresIn) => {
  return jwt.sign({ id }, secret, { expiresIn });
};

// Function to send JWT tokens as cookies and respond with user data
const sendCookieToken = (user, statusCode, res, message) => {
  const token = signToken(
    user._id,
    process.env.JWT_SECRET,
    process.env.JWT_EXPIRES_IN || "90d" // Default to 30 day if no expiration is set
  );

  // Define options for the cookies
  const cookieOptions = {
    httpOnly: true, // Cookie is only accessible via HTTP(S), not JavaScript
    secure: process.env.NODE_ENV === "production", // Set secure flag only in production
    sameSite: "none", // Allows the cookie to be sent with requests from other domains
    maxAge: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
  };

  // Set token cookie to expire in 24 hours
  res.cookie("token", token, { cookieOptions });

  // Send user data as response
  sendResponse(user, statusCode, res, message);
};

module.exports = { signToken, sendCookieToken };
