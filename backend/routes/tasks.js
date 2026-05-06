const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getProjectMembers
} = require('../controllers/taskController');

router.get('/members/:projectId', auth, getProjectMembers); // ← NEW
router.post('/', auth, createTask);
router.get('/:projectId', auth, getTasks);
router.put('/:id', auth, updateTask);
router.delete('/:id', auth, deleteTask);

module.exports = router;