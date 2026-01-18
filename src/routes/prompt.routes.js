const express = require("express");
const router = express.Router({ mergeParams: true }); 
const {
  getPrompt,
  createOrUpdatePrompt,
} = require("../controllers/prompt.controller");
const { protect } = require("../middleware/auth");
router.use(protect);
router.route("/").get(getPrompt).post(createOrUpdatePrompt);
module.exports = router;