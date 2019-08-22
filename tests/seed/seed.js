const { ObjectID } = require('mongodb');
const { Todo } = require('../../models/todo');
const { User } = require('../../models/user');
const jwt = require('jsonwebtoken');

const userOneId = new ObjectID()
const userTwoId = new ObjectID()
// Fake data
const users = [
  {
    _id: userOneId,
    email: 'john@example.com',
    password: 'userOnePass',
    tokens: [{
      access: 'auth',
      token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET).toString()
    }]
  },
  {
    _id: userTwoId,
    email: 'josh@example.com',
    password: 'userTwoPass',
    tokens: [{
      access: 'auth',
      token: jwt.sign({_id: userTwoId, access: 'auth'}, process.env.JWT_SECRET).toString()
    }]
  }
]

const todos = [{
  _id: new ObjectID(),
  text: 'First test todo',
  _creator: userOneId
},{
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 333,
  _creator: userTwoId
}]

// Before each test suite delete All and insert fake data
const populateTodos = (done) => {
  Todo.deleteMany({})
      .then(() => {
        return Todo.insertMany(todos);
      })
      .then(() => done());
}

const populateUsers = (done) => {
  User.deleteMany({})
      .then(() => {
        let userOne = new User(users[0]).save();
        let userTwo = new User(users[1]).save();
        return Promise.all([userOne, userTwo])
      })
      .then(() => done());
}

module.exports = { todos, populateTodos, users, populateUsers };