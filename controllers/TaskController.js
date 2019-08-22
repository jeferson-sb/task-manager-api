const Task = require('../models/Task');
const { ObjectID } = require('mongodb');
const { pick, isBoolean } = require('../utils');

const index = async (req, res) => {
  // const match = {};
  // match._creator = req.user._id;

  // // GET /todos?completed=true
  // if (req.query.completed) {
  //   match.completed = req.query.completed === 'true';
  // }
  // // GET /todos?limit=2
  // if (req.query.limit) {
  //   let limit = parseInt(req.query.limit);
  //   Task.find(match)
  //     .limit(limit)
  //     .then(tasks => res.send({ tasks }), err => res.status(400).send(err));
  // }

  // GET /todos?limit=10&skip=3
  // if (req.query.skip && req.query.limit) {
  //   let limit = parseInt(req.query.limit);
  //   let skip = parseInt(req.query.skip);
  //   match.skip = skip;
  //   Task.find(match)
  //     .limit(limit)
  //     .then(tasks => res.send({ tasks }), err => res.status(400).send(err));
  // }

  try {
    await req.user.populate('tasks').execPopulate();
    res.send(req.user.tasks);
  } catch (error) {
    res.sendStatus(500);
  }
};

const store = async (req, res) => {
  try {
    const task = new Task({
      text: req.body.text,
      creator: req.user._id
    });

    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(`Error: ${e}`);
  }
};

const show = (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(400).send();
  }
  Task.findOne({ _id: id, _creator: req.user._id })
    .then(task => {
      if (!task) {
        return res.status(404).send();
      }
      res.send({ todo });
    })
    .catch(err => res.status(400).send());
};

const update = (req, res) => {
  const id = req.params.id;
  const body = pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Task.findOneAndUpdate(
    { _id: id, _creator: req.user._id },
    { $set: body },
    { new: true }
  )
    .then(task => {
      if (!task) {
        return res.sendStatus(404);
      }
      res.send({ task });
    })
    .catch(e => {
      res.sendStatus(400);
    });
};

const destroy = async () => {
  try {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
      return res.sendStatus(404);
    }
    const task = await Task.findOneAndRemove({
      _id: id,
      _creator: req.user._id
    });
    if (!task) {
      return res.sendStatus(404);
    }
    res.send({ task });
  } catch (error) {
    res.sendStatus(400);
  }
};

module.exports = { index, store, show, update, destroy };
