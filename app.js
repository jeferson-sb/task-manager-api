require('dotenv').config();
const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const userRouter = require('./routes/user');
const taskRouter = require('./routes/task');

// Setup Database
require('./db/mongoose');

const app = express();

let requestLogStream = fs.createWriteStream(`${__dirname}/request.log`, {
  flags: 'a'
});

app
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(morgan('tiny', { stream: requestLogStream }))
  .use('/users', userRouter)
  .use('/tasks', taskRouter)
  .use((req, res, next) => {
    res.status(404).send('Page not found!');
  });

module.exports = app;
