const User = require('../models/User');
const multer = require('multer');
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account');

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
    sendWelcomeEmail(user.email, user.name);
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
    sendCancelationEmail(req.user.email, req.user.name);
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

const upload = multer({
  limits: {
    fileSize: 100000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('File must be an image'));
    }
    cb(undefined, true);
  }
});

const storeAvatar = async (req, res) => {
  const buffer = await sharp(req.file.buffer)
    .resize({ width: 250, height: 250 })
    .png()
    .toBuffer();
  req.user.avatar = buffer;
  await req.user.save();
  res.send();
};

const destroyAvatar = async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.end();
};

const showAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) throw new Error();

    res.type('image/png');
    res.send(user.avatar);
  } catch (error) {
    res.sendStatus(404);
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
  logoutAll,
  upload,
  storeAvatar,
  showAvatar,
  destroyAvatar
};
