const Task = require('../models/Task');
const { ObjectID } = require('mongodb');
const { pick, isBoolean } = require('../utils');

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc
const index = async (req, res) => {
  const match = {};
  const sort = {};
  const { completed, sortBy, limit, skip } = req.query;

  if (completed) {
    match.completed = completed === 'true';
  }

  if (sortBy) {
    const parts = sortBy.split(':');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  }

  try {
    await req.user
      .populate({
        path: 'tasks',
        match,
        options: {
          limit: parseInt(limit),
          skip: parseInt(skip),
          sort
        }
      })
      .execPopulate();
    res.send(req.user.tasks);
  } catch (error) {
    res.sendStatus(500);
  }
};

const store = async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
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
  const updates = Object.keys(req.body);
  const allowedUpdates = ['text', 'completed'];
  const isValidOperation = updates.every(update =>
    allowedUpdates.includes(update)
  );

  if (!ObjectID.isValid(_id) || !isValidOperation) {
    return res.sendStatus(404);
  }

  try {
    let task = await Task.findOne({ _id, creator: req.user._id });

    if (!task) {
      return res.sendStatus(404);
    }

    updates.forEach(update => {
      task[update] = req.body[update];
      if (update === 'completed' && req.body[update]) {
        task['completedAt'] = new Date().getTime();
      } else {
        task['completedAt'] = null;
      }
    });

    await task.save();
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
    console.log(e);
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
