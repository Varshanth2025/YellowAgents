require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/database");
const fs = require("fs");
const path = require("path");
const PORT = process.env.PORT || 5000;
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Created uploads directory");
}
connectDB();
const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
  );
});
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
  server.close(() => process.exit(1));
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  process.exit(1);
});
