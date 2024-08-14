// Handle uncaught exceptions
process.on("uncaughtException", err => {
  console.log("UNCAUGHT EXCEPTION!💥💥💥🙄💥💥💥 Shutting down... ");
  console.log(err.name, err.message);
  process.exit(1); // Exit the process to avoid inconsistent state
});

require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const dbConnect = require("./config/dbConnect");
const AppError = require("./utils/appError");
const sendResponse = require("./utils/sendResponse");
const errorGlobalMiddleware = require("./middlewares/errorMiddleware");
const authRoutes = require("./routes/userRoute");
const apiRateLimiter = require("./utils/apiRateLimiter");

const port = process.env.PORT || 7019;

const app = express();

// Configure Express to trust the first proxy
app.set("trust proxy", 1);

const corsOptions = {
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Allow credentials
};

// Set up CORS middleware to allow requests from different domains
app.use(cors(corsOptions));

// Parse incoming JSON request bodies with a size limit
app.use(express.json({ limit: "10kb" }));

// Set up rate limiting for /api routes to prevent abuse
app.use("/api", apiRateLimiter());

// Parse cookies from request headers
app.use(cookieParser());

// Log HTTP requests in development mode
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// Connect to the MongoDB database
dbConnect(process.env.DATABASE_URI);

// Health check endpoint
app.get("/", (req, res) => {
  sendResponse(null, 200, res, "Server is up and running...");
});

// Set up routes for various API endpoints
app.use("/api/v1/auth", authRoutes);

// Handle 404 errors for all other routes
app.all("*", (req, res, next) =>
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
);

// Global error handling middleware
app.use(errorGlobalMiddleware);

// Start the server and listen on the specified port
app.listen(port, () => console.log(`Server is listening on port ${port}...`));

// Handle unhandled promise rejections
process.on("unhandledRejection", err => {
  console.log("UNHANDLED REJECTION!💥💥💥🙄💥💥💥 Shutting down... ");
  console.log(err.name, err.message);
  process.exit(1); // Exit the process to avoid inconsistent state
});
