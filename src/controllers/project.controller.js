const Project = require("../models/Project.model");
const { AppError } = require("../middleware/errorHandler");
exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ createdBy: req.user.id }).sort({
      createdAt: -1,
    });
    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });
    if (!project) {
      return next(new AppError("Project not found", 404));
    }
    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};
exports.createProject = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    const project = await Project.create(req.body);
    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};
exports.updateProject = async (req, res, next) => {
  try {
    let project = await Project.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });
    if (!project) {
      return next(new AppError("Project not found", 404));
    }
    delete req.body.createdBy;
    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });
    if (!project) {
      return next(new AppError("Project not found", 404));
    }
    await project.deleteOne();
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};