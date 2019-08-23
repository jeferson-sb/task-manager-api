const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function auth(req, res, next) {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token
    });

    if (!user) {
      throw new Error('The user does not exists!');
    }
    req.token = token;
    req.user = user;
    return next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate first.' });
  }
}

module.exports = auth;
