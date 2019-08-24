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

const show = async (req, res) => {
  const _id = req.params.id;

  if (!ObjectID.isValid(_id)) {
    return res.sendStatus(400);
  }

  try {
    const task = await Task.findOne({ _id, creator: req.user._id });
    if (!task) {
      return res.sendStatus(404);
    }
    res.send(task);
  } catch (error) {}
};

const update = async (req, res) => {
  const _id = req.params.id;
  const { text, completed } = pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(_id)) {
    return res.sendStatus(404);
  }

  try {
    let task = await Task.findOne({ _id, creator: req.user._id });

    if (!task) {
      return res.sendStatus(404);
    }

    task['text'] = text;

    if (isBoolean(completed) && completed === true) {
      task['completed'] = completed;
      task['completedAt'] = new Date().getTime();
    } else {
      task['completed'] = false;
      task['completedAt'] = null;
    }

    await task.save();
    res.send(task);
  } catch (error) {
    res.sendStatus(400);
  }
};

const destroy = async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
      return res.sendStatus(404);
    }
    const task = await Task.findOneAndRemove({
      _id: id,
      creator: req.user._id
    });
    if (!task) {
      return res.sendStatus(404);
    }
    res.send(task);
  } catch (error) {
    res.sendStatus(400);
  }
};

module.exports = { index, store, show, update, destroy };
