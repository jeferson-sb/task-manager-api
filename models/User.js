const { model, Schema } = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Task = require('./Task');
const { pick } = require('../utils');

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      required: true,
      type: String,
      trim: true,
      minlength: 1,
      unique: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Email is invalid');
        }
      }
    },
    password: {
      type: String,
      require: true,
      minlength: 6,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes('password')) {
          throw new Error('Password cannot contain "password"');
        }
      }
    },
    age: {
      type: Number,
      default: 18,
      validate(value) {
        if (value < 0) throw new Error('Age must be a positive number');
      }
    },
    tokens: [
      {
        token: {
          type: String,
          required: true
        }
      }
    ],
    avatar: {
      type: Buffer
    }
  },
  {
    timestamps: true
  }
);

UserSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'creator'
});

// Model methods
UserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  return pick(userObject, ['_id', 'name', 'email', 'age']);
};

UserSchema.methods.generateAuthToken = async function() {
  // Generate jwt token
  const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET);

  this.tokens = this.tokens.concat({ token });
  await this.save();
  return token;
};

UserSchema.statics.findByCredentials = async function(email, password) {
  try {
    const user = await this.findOne({ email });
    if (!user) {
      throw new Error('Unable to login');
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) throw new Error('Unable to login');

    return user;
  } catch (error) {
    throw new Error(error);
  }
};

// Encrypt password before saving the user
UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  } else {
    next();
  }
});

UserSchema.pre('remove', async function(next) {
  await Task.deleteMany({ creator: this._id });
  next();
});

module.exports = model('User', UserSchema);
