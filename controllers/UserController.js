const User = require('../models/User');

const index = async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    res.sendStatus(500);
  }
};

const store = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send('Error : ' + error);
  }
};

const show = (req, res) => {
  if (!req.user) {
    res.status(400).send('User is not defined');
  }
  res.send(req.user);
};

const update = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password', 'age'];
  const isValidOperation = updates.every(update =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    updates.forEach(update => (req.user[update] = req.body[update]));
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
};

const destroy = async (req, res) => {
  try {
    await req.user.remove();
    // sendCancelationEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (error) {
    res.sendStatus(500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.sendStatus(400);
  }
};

const logout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.sendStatus(200);
  } catch (error) {
    res.status(500).send();
  }
};

const logoutAll = async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
};

module.exports = {
  index,
  store,
  show,
  destroy,
  update,
  login,
  logout,
  logoutAll
};
