const router = require('express').Router();
const TaskController = require('../controllers/TaskController');
const auth = require('../middleware/auth');

router
  .route('/')
  .get(auth, TaskController.index)
  .post(auth, TaskController.store);

router
  .route('/:id')
  .get(auth, TaskController.show)
  .patch(auth, TaskController.update)
  .delete(auth, TaskController.destroy);

module.exports = router;
