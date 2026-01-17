const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams to access :projectId
const {
  getPrompt,
  createOrUpdatePrompt,
} = require("../controllers/prompt.controller");
const { protect } = require("../middleware/auth");

// All routes are protected
router.use(protect);

router.route("/").get(getPrompt).post(createOrUpdatePrompt);

module.exports = router;
