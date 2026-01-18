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
const promptRoutes = require("./prompt.routes");
const fileRoutes = require("./file.routes");
router.use(protect);
router.route("/").get(getProjects).post(createProject);
router.route("/:id").get(getProject).put(updateProject).delete(deleteProject);
router.use("/:projectId/prompt", promptRoutes);
router.use("/:projectId/files", fileRoutes);
module.exports = router;