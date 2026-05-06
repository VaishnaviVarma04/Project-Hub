const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  createProject,
  getProjects,
  addMember,
  removeMember,
  deleteProject
} = require('../controllers/projectController');

router.post('/', auth, createProject);
router.get('/', auth, getProjects);
router.put('/:id/members', auth, addMember);
router.delete('/:id/members', auth, removeMember);
router.delete('/:id', auth, deleteProject);

module.exports = router;