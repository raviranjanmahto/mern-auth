class AppError extends Error {
  // Constructor for creating a new AppError instance
  constructor(message, statusCode) {
    super(message);

    // Set HTTP status code for the error
    this.statusCode = statusCode;

    // Determine if the status is operational based on the status code
    this.status = `${statusCode}`.startsWith("4") ? false : "error";

    // Indicate that the error is operational (trusted)
    this.isOperational = true;

    // Capture the stack trace for debugging purposes
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
