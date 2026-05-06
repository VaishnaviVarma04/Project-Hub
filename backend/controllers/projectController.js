const Project = require('../models/Project');
const User = require('../models/User');

exports.createProject = async (req, res) => {
  if (!req.body.name) return res.status(400).json({ msg: 'Project name is required' });
  try {
    const project = await Project.create({ ...req.body, owner: req.user.id, members: [req.user.id] });
    res.status(201).json(project);
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
};

exports.getProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'Admin') {
      projects = await Project.find().populate('owner', 'name email').populate('members', 'name email');
    } else {
      projects = await Project.find({ members: req.user.id }).populate('owner', 'name email').populate('members', 'name email');
    }
    res.json(projects);
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
};

exports.addMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });
    if (String(project.owner) !== req.user.id) return res.status(403).json({ msg: 'Only owner can add members' });

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    project.members.addToSet(user._id);
    await project.save();
    res.json({ msg: `${user.name} added successfully`, project });
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
};

exports.removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    // Fix: convert both to string for comparison
    if (project.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ msg: 'Only owner can remove members' });
    }

    if (project.owner.toString() === req.body.userId) {
      return res.status(400).json({ msg: 'Cannot remove the project owner' });
    }

    project.members.pull(req.body.userId);
    await project.save();
    res.json({ msg: 'Member removed successfully' });
  } catch (err) {
    console.error('removeMember error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Project deleted' });
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
};