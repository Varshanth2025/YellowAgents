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

// Import prompt routes
const promptRoutes = require("./prompt.routes");

// All routes are protected
router.use(protect);

router.route("/").get(getProjects).post(createProject);

router.route("/:id").get(getProject).put(updateProject).delete(deleteProject);

// Nested prompt routes: /api/projects/:projectId/prompt
router.use("/:projectId/prompt", promptRoutes);

module.exports = router;
