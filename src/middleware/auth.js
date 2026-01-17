const jwt = require("jsonwebtoken");
const { AppError } = require("./errorHandler");

/**
 * Middleware to protect routes - verify JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Check if token exists
    if (!token) {
      return next(new AppError("Not authorized to access this route", 401));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request object
      req.user = { id: decoded.id };

      next();
    } catch (err) {
      return next(new AppError("Not authorized to access this route", 401));
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { protect };
