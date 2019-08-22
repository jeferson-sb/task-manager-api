const mongoose = require('mongoose');

const options = {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true
};

// Connect to database
mongoose.connect(process.env.MONGODB_URI, options);

module.exports = { mongoose };
