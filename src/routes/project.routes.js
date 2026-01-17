const express = require("express");
const router = express.Router();
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/project.controller");
const { protect } = require("../middleware/auth");

// Import nested routes
const promptRoutes = require("./prompt.routes");
const fileRoutes = require("./file.routes");

// All routes are protected
router.use(protect);

router.route("/").get(getProjects).post(createProject);

router.route("/:id").get(getProject).put(updateProject).delete(deleteProject);

// Nested prompt routes: /api/projects/:projectId/prompt
router.use("/:projectId/prompt", promptRoutes);

// Nested file routes: /api/projects/:projectId/files
router.use("/:projectId/files", fileRoutes);

module.exports = router;
