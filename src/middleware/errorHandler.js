class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  console.error("Error:", err);
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = new AppError(message, 404);
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value: ${field}. Please use another value.`;
    error = new AppError(message, 400);
  }
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = new AppError(message, 400);
  }
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token. Please log in again.";
    error = new AppError(message, 401);
  }
  if (err.name === "TokenExpiredError") {
    const message = "Your token has expired. Please log in again.";
    error = new AppError(message, 401);
  }
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
module.exports = errorHandler;
module.exports.AppError = AppError;