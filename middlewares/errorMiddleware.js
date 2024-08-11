const AppError = require("../utils/appError");

// Handles cast errors for invalid data types
const handleCastErrorDb = err => {
  return new AppError(`Invalid ${err.path}: ${err.value._id}`, 400);
};

// Handles validation errors for invalid input data
const handleValidationErrorDb = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

// Handles duplicate field errors (e.g., unique constraint violations)
const handleDuplicateFieldDb = err => {
  const name = Object.keys(err.keyValue)[0];
  const value = Object.values(err.keyValue)[0];
  const message = `Duplicate field "${name}: ${value}". Please use another ${name}!`;
  return new AppError(message, 400);
};

// Handles token expired errors
const handleTokenExpiredError = () => {
  return new AppError("Your token has expired. Please log in again.", 401);
};

// Handles JSON Web Token errors (e.g., invalid signature)
const handleJsonWebTokenError = () => {
  return new AppError("Invalid token. Please log in again.", 401);
};

// Global error handling middleware
module.exports = (err, req, res, next) => {
  // Set default error properties
  err.statusCode = err.statusCode || 500;
  err.status = err.status ?? "error";
  err.message = err.message || "Something went wrong!";

  // Error handling in development environment
  if (process.env.NODE_ENV === "development")
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      isOperational: err.isOperational || false,
      error: err,
      stack: err.stack || null,
    });
  // Error handling in production environment
  else if (process.env.NODE_ENV === "production") {
    // Handle specific error types
    if (err.name === "CastError") err = handleCastErrorDb(err);
    if (err.name === "ValidationError") err = handleValidationErrorDb(err);
    if (err.code === 11000) err = handleDuplicateFieldDb(err);
    if (err.name === "TokenExpiredError") err = handleTokenExpiredError();
    if (err.name === "JsonWebTokenError") err = handleJsonWebTokenError();

    // Handle operational errors (trusted errors)
    if (err.isOperational)
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });

    // Handle unknown or programming errors (send a generic message to the client)
    return res.status(err.statusCode).json({
      status: "error",
      message: "Something went very wrong!!!",
    });
  }
};
