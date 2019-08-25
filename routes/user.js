const router = require('express').Router();
const UserController = require('../controllers/UserController');
const auth = require('../middleware/auth');

router.get('/', UserController.index);
router.post('/', UserController.store);
router
  .route('/me')
  .get(auth, UserController.show)
  .patch(auth, UserController.update)
  .delete(auth, UserController.destroy);

router.post('/login', UserController.login);
router.post('/logout', auth, UserController.logout);
router.post('/logoutall', auth, UserController.logoutAll);

router
  .route('/me/avatar')
  .post(
    auth,
    UserController.upload.single('avatar'),
    UserController.storeAvatar,
    (error, req, res, next) => {
      res.status(400).send({ error: error.message });
    }
  )
  .delete(auth, UserController.destroyAvatar);

router.get('/:id/avatar', UserController.showAvatar);

module.exports = router;
