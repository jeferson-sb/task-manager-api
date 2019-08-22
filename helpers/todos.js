const { Todo } = require('../models/Task');
const { User } = require('../models/User');

const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account');

exports.createTodo = (req, res) => {};

exports.getTodo = (req, res) => {};

exports.updateTodo = (req, res) => {};

exports.deleteTodo = async (req, res) => {};

exports.postUser = async (req, res) => {
  try {
    // sendWelcomeEmail(user.email, user.name);
  } catch (error) {}
};

exports.deleteUser = async (req, res) => {};

exports.getUser = (req, res) => {
  res.send(req.user);
};

exports.login = async (req, res) => {};

exports.logout = async (req, res) => {};

exports.upload = async (req, res) => {
  req.user.avatar = req.file.buffer;
  await req.user.save();
  res.send();
};

exports.getUserAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set('Content-Type', 'image/jpg');
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send();
  }
};

module.exports = exports;
