const rateLimit = require("express-rate-limit");
const AppError = require("./appError");

const apiRateLimiter = (max = 100, windowMs = 15 * 60 * 1000) => {
  return rateLimit({
    windowMs,
    max,
    handler: (req, res, next) =>
      next(new AppError("Too many requests, please try again later", 429)),
  });
};

module.exports = apiRateLimiter;
