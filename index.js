require('dotenv').config();
const express = require('express');
const userRouter = require('./routes/user');
const taskRouter = require('./routes/task');

// Setup Database
require('./db/mongoose');

const app = express();
const port = process.env.PORT || 3000;

app
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use('/users', userRouter)
  .use('/tasks', taskRouter)
  .use((req, res, next) => {
    res.status(404).send('Page not found!');
  });

// const multer = require('multer');
// const upload = multer({
//   dest: 'images',
//   fileFilter(req, file, cb) {
//     if (!file.originalname.match(/\.(doc|docx)$/)) {
//       return cb(new Error('File must be a Word document'));
//     }
//     cb(undefined, true);
//   }
// });

// app.post(
//   '/upload',
//   upload.single('upload'),
//   (req, res) => {
//     res.send();
//   },
//   (err, req, res, next) => {
//     res.status(400).send({ error: err.message });
//   }
// );

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
