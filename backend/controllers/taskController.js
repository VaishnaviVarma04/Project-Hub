const Task = require('../models/Task');
const Project = require('../models/Project');

exports.createTask = async (req, res) => {
  if (!req.body.title) return res.status(400).json({ msg: 'Task title is required' });
  if (!req.body.project) return res.status(400).json({ msg: 'Project ID is required' });
  try {
    const task = await Task.create({ ...req.body, createdBy: req.user.id });
    const populated = await task.populate('assignedTo', 'name email');
    res.status(201).json(populated);
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
};

exports.getTasks = async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'Admin') {
      // Admin sees all tasks in the project
      tasks = await Task.find({ project: req.params.projectId })
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name');
    } else {
      // Member sees only tasks assigned to them
      tasks = await Task.find({ project: req.params.projectId, assignedTo: req.user.id })
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name');
    }
    res.json(tasks);
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('assignedTo', 'name email');
    res.json(task);
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
};

exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Task deleted' });
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
};

// Get members of a project (for assignment dropdown)
exports.getProjectMembers = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate('members', 'name email role');
    if (!project) return res.status(404).json({ msg: 'Project not found' });
    res.json(project.members);
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
};