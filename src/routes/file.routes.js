const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams to access :projectId
const multer = require("multer");
const path = require("path");
const { protect } = require("../middleware/auth");
const {
  uploadFile,
  getProjectFiles,
  getFile,
  deleteFile,
} = require("../controllers/file.controller");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Temporary storage
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

// File filter to allow specific types
const fileFilter = (req, file, cb) => {
  // Allowed file types for OpenAI
  const allowedTypes = [
    "text/plain",
    "application/pdf",
    "application/json",
    "text/markdown",
    "text/csv",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/javascript",
    "application/javascript",
    "text/x-python",
    "text/html",
    "text/css",
  ];

  if (
    allowedTypes.includes(file.mimetype) ||
    file.mimetype.startsWith("text/")
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Unsupported file type. Please upload text, PDF, code, or document files.",
      ),
      false,
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 512 * 1024 * 1024, // 512MB max (OpenAI limit)
  },
});

// All routes are protected and use projectId from parent router
router.post("/", protect, upload.single("file"), uploadFile);
router.get("/", protect, getProjectFiles);
router.get("/:fileId", protect, getFile);
router.delete("/:fileId", protect, deleteFile);

module.exports = router;
