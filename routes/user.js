const router = require('express').Router();
const UserController = require('../controllers/UserController');
const auth = require('../middleware/auth');

// const multer = require('multer');
// const upload = multer({
//   dest: 'images',
//   limits: {
//     fileSize: 100000
//   },
//   fileFilter(req, file, cb) {
//     if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
//       return cb(new Error('File must be an image'));
//     }
//     cb(undefined, true);
//   }
// });

router.post('/', UserController.store);
router
  .route('/me')
  .get(auth, UserController.show)
  .patch(auth, UserController.update)
  .delete(auth, UserController.destroy);

router.post('/login', UserController.login);
router.delete('/logout', auth, UserController.logout);

// router
//   .route('/me/avatar')
//   .post(upload.single('avatar'), helpers.upload, (err, req, res, next) => {
//     res.status(400).send({ err: err.message });
//   })
//   .delete(authenticate, async (req, res) => {
//     try {
//       req.user.avatar = undefined;
//       await req.user.save();
//       res.status(200).send();
//     } catch (error) {
//       res.status(400).send();
//     }
//   });

// router.route('/:id/avatar').post(upload.single('avatar'), helpers.upload);

// router.route('/:id/avatar').get(helpers.getUserAvatar);

module.exports = router;
