const Prompt = require("../models/Prompt.model");
const Project = require("../models/Project.model");
const { AppError } = require("../middleware/errorHandler");
exports.getPrompt = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findOne({
      _id: projectId,
      createdBy: req.user.id,
    });
    if (!project) {
      return next(new AppError("Project not found", 404));
    }
    const prompt = await Prompt.findOne({
      projectId: projectId,
      createdBy: req.user.id,
      isActive: true,
    });
    if (!prompt) {
      return next(new AppError("Prompt not found for this project", 404));
    }
    res.status(200).json({
      success: true,
      data: prompt,
    });
  } catch (error) {
    next(error);
  }
};
exports.createOrUpdatePrompt = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { systemPrompt } = req.body;
    if (!systemPrompt) {
      return next(new AppError("System prompt is required", 400));
    }
    const project = await Project.findOne({
      _id: projectId,
      createdBy: req.user.id,
    });
    if (!project) {
      return next(new AppError("Project not found", 404));
    }
    let prompt = await Prompt.findOne({
      projectId: projectId,
      createdBy: req.user.id,
      isActive: true,
    });
    if (prompt) {
      prompt.systemPrompt = systemPrompt;
      prompt.version = prompt.version + 1;
      await prompt.save();
      res.status(200).json({
        success: true,
        message: "Prompt updated successfully",
        data: prompt,
      });
    } else {
      prompt = await Prompt.create({
        projectId: projectId,
        systemPrompt: systemPrompt,
        createdBy: req.user.id,
      });
      res.status(201).json({
        success: true,
        message: "Prompt created successfully",
        data: prompt,
      });
    }
  } catch (error) {
    next(error);
  }
};