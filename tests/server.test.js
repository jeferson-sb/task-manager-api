const expect = require('chai').expect;
const request = require('supertest');
const { app } = require('../server');
const { Todo } = require('../models/todo');
const { User } = require('../models/user');
const { ObjectID } = require('mongodb');
const { todos, populateTodos, users, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

// Test post request
describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    let text = 'Test todo text';

    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({ text })
      .expect(201)
      .expect((res) => {
        // expect data send back by server to be equal the data sent
        expect(res.body.text).to.equal(text);
      })
      .end((err, res) => {
        if(err){
          return done(err);
        }

        // Find the todo and expect to get 1
        Todo.find({ text })
            .then(todos => {
              expect(todos.length).to.equal(1);
              expect(todos[0].text).to.equal(text);
              done();
            })
            .catch(e => done(e))
            ;
      })
  })
  it('should not create todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      // Sending invalidy body
      .send({})
      .expect(400)
      .end((err, res) => {
        if(err){
          return done(err);
        }

        Todo.find()
            .then(todos => {
              expect(todos.length).to.equal(2);
              done();
            })
            .catch(e => done(e))
            ;
      })
  })
})

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).to.equal(1);
      })
      .end(done);
  })
})

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).to.equal(todos[0].text)
      })
      .end(done)
      ;
  })
  it('should return 404 if todo not found', (done) => {
    let hexId = new ObjectID().toHexString();
    request(app)
      .get(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  })
  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get('/todos/123abc')
      .set('x-auth', users[0].tokens[0].token)
      .expect(400)
      .end(done);
  })
  it('should not return todo doc created by other user', (done) => {
    request(app)
      .get(`/todos/${todos[1]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done)
      ;
  })
})

describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    let hexId = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).to.equal(hexId)
      })
      .end( (err, res) => {
        if(err) {
          return done(err);
        }
        Todo.findById(hexId)
            .then(todo => {
              expect(todo).to.equal(null)
              done();
            })
            .catch(e => done(e));
      })

  });

  it('should remove a todo', (done) => {
    let hexId = todos[0]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end( (err, res) => {
        if(err) {
          return done(err);
        }
        Todo.findById(hexId)
            .then(todo => {
              expect(todo).to.exist;
              done();
            })
            .catch(e => done(e));
      })

  });

  it('should return 404 if todo not found', (done) => {
    let hexId = new ObjectID().toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });
  it('should return 404 if object id is invalid', (done) => {
    request(app)
      .delete('/todos/123abc')
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });
})

describe('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {
    const hexId = todos[0]._id.toHexString();
    const text = 'This should be the new text';

    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({
        completed: true,
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).to.be.equal(text);
        expect(res.body.todo.completed).to.be.true;
        expect(res.body.todo.completedAt).to.be.a('number')
      })
      .end(done)
      ;
  })
  it('should not update the todo created by other user', (done) => {
    const hexId = todos[1]._id.toHexString();
    const text = 'This should be the new text';

    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .send({
        completed: true,
        text
      })
      .expect(404)
      .end(done)
      ;
  })
  it('should clear completedAt when todo is not completed', (done) => {
    const hexId = todos[1]._id.toHexString();
    const text = 'This should be the new text!!!';

    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .send({
        completed: false,
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).to.be.equal(text);
        expect(res.body.todo.completed).to.be.false;
        expect(res.body.todo.completedAt).to.be.null;
      })
      .end(done)
      ;
  })
}) 

describe('GET /users/me', () => {
  it('should return user if authenticated', done => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body._id).to.be.equal(users[0]._id.toHexString())
        expect(res.body.email).to.be.equal(users[0].email)
      })
      .end(done)
      ;
  })
  it('should return 401 if not authenticated', done => {
    request(app)
    .get('/users/me')
    .expect(401)
    .expect( ({ body }) => {
      expect(body).to.include({}) // use { body }
    })
    .end(done)
    ;
  })
})

describe('POST /users', () => {
  it('should create a user', (done) => {
    const email = 'example@example.com';
    const pwd = '123mnb!';
    request(app)
      .post('/users')
      .send({ email, pwd })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).to.exist;
        expect(res.body._id).to.exist;
        expect(res.body.email).to.be.equal(email);
      })
      .end((err) => {
        if(err){
          return done(err);
        }
        User.findOne({ email })
             .then(user => {
               expect(user).to.exist;
               expect(user.password).to.not.be.equal(pwd)
               done()
             })
             .catch((e) => done(e))
             ;
      })
      ;
    })

  it('should return validation errors if request invalid', done => {
    const email = 'example@example';
    const pwd = '123';  
    request(app)
        .post('/users')
        .send({ email, pwd })
        .expect(400)
        .end(done)
        ;
  })
  it('should not create user if email is use', (done) => {
    request(app)
      .post('/users')
      .send({
        email: users[0].email,
        pwd: '123456'
      })
      .expect(400)
      .end(done)
      ;
  })
})

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).to.exist;
      })
      .end((err, res) => {
        if(err){
          return done(err);
        }
        User.findById(users[1]._id)
            .then(user => {
              expect(user.tokens[1]).to.include({
                access: 'auth',
                token: res.headers['x-auth']
              })
              done();
            })
            .catch((e) => done(e))
            ;
      })
      ;
  })
  it('should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: 'wild123'
      })
      .expect(400)
      .expect(res => {
        expect(res.headers['x-auth']).to.not.exist;
      })
      .end((err, res) => {
        if(err){
          return done(err);
        }
        User.findById(users[1]._id)
            .then(user => {
              expect(user.tokens.length).to.be.equal(1);
              done();
            })
            .catch(e => done(e))
            ;
      })
  })
})

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if(err){
          return done(err);
        }
        User.findById(users[0]._id)
            .then(user => {
              expect(user.tokens.length).to.be.equal(0);
              done();
            })
            .catch(e => done(e))
            ;
      })
  })
})