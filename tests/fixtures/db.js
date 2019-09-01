const jwt = require('jsonwebtoken');
const ObjectId = require('mongoose').Types.ObjectId;
const User = require('../../models/User');
const Task = require('../../models/Task');

const userOneId = new ObjectId();
const userOne = {
  _id: userOneId,
  name: 'John Doe',
  email: 'johndoe@web.com',
  password: 'MyPass123',
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }
  ]
};

const userTwoId = new ObjectId();
const userTwo = {
  _id: userTwoId,
  name: 'Mike',
  email: 'mike@web.com',
  password: 'Pass321OhMy',
  tokens: [
    {
      token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
    }
  ]
};

const taskOne = {
  _id: new ObjectId(),
  text: 'First task',
  completed: false,
  creator: userOneId
};
const taskTwo = {
  _id: new ObjectId(),
  text: 'Second task',
  completed: true,
  creator: userOneId
};
const taskThree = {
  _id: new ObjectId(),
  text: 'Third task',
  completed: true,
  creator: userTwoId
};

const setupDB = async () => {
  await User.deleteMany();
  await Task.deleteMany();
  await new User(userOne).save();
  await new User(userTwo).save();
  await new Task(taskOne).save();
  await new Task(taskTwo).save();
  await new Task(taskThree).save();
};

module.exports = {
  userOneId,
  userOne,
  userTwo,
  userTwoId,
  taskOne,
  taskTwo,
  taskThree,
  setupDB
};
