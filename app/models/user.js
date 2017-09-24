const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require('../config');

/**
 * Asynchronous Validation
 */
const uniqueUsernameAsyncValidation = function (username, callback) {
  if (this.skipValidation()) {
    callback(true);
  } else {
    const User = mongoose.model('User');

    // Before accept an username, it needs to be checked if there's no other user with the same one
    // Should run only when recording a new user
    if (this.isNew) {
      User.find({ username: username }).exec(function (err, res) {
        callback(!err && res.length === 0);
      });
    }
  }
};

const uniqueEmailAsyncValidation = function (email, callback) {
  if (this.skipValidation()) {
    callback(true);
  } else {
    const User = mongoose.model('User');

    // Before accept an email, it needs to be checked if there's no other user with the same one
    // Should run only when recording a new user
    if (this.isNew) {
      User.find({ email: email }).exec(function (err, res) {
        callback(!err && res.length === 0);
      });
    }
  }
};

/**
 * User Schema
 */
const UserSchema = new Schema({
  name: { type: String, default: '' },
  username: { type: String, default: '', validate: { isAsync: true, validator: uniqueUsernameAsyncValidation, message: 'USERNAME_ALREADY_EXISTS' } },
  hashed_password: { type: String },
  email: { type: String, default: '', validate: { isAsync: true, validator: uniqueEmailAsyncValidation, message: 'EMAIL_ALREADY_EXISTS' } },
  birthday: { type: Date, default: '' },
  homes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Home' }],
  active: { type: Boolean, default: true }
});

/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function (password) {
      this._password = password;
  })
  .get(function () {
      return this._password;
  });

/**
 * Synchronous Validation
 */
UserSchema.path('username').validate(function (username) {
  if (this.skipValidation()) return true;
  return username.length;
}, 'BLANK_USERNAME');

UserSchema.path('name').validate(function (name) {
  if (this.skipValidation()) return true;
  return name.length;
}, 'BLANK_NAME');

UserSchema.path('email').validate(function (email) {
  if (this.skipValidation()) return true;
  return email.length;
}, 'BLANK_EMAIL');

UserSchema.path('email').validate(function (email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}, 'INVALID_EMAIL');

UserSchema.path('hashed_password').validate(function (password) {
  if (this.skipValidation()) return true;
  return this._password.length;
}, 'BLANK_PASSWORD');

UserSchema.path('birthday').validate(function (birthday) {
  if (this.skipValidation()) return true;
  return this.birthday;
}, 'BLANK_BIRTHDAY');

/**
 * Pre-save hook
 */
UserSchema.pre('save', function (next) {
  if (!this.isNew) return next();

  this.active = true;

  bcrypt
    .hash(this._password, config.saltRounds())
    .then((hash) => {
      this.hashed_password = hash;
      next();
    })
    .catch((err) => {
      throw err;
    });
});

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Skip Validation in case of using OAuth
   */
  skipValidation: function () {
    return false;
  }
};

/**
 * Statics
 */
UserSchema.statics = {
  /**
   * Load
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */
  load: function (options, callback) {
    options.select = options.select || '-hashed_password';
    return this.find(options.criteria)
      .select(options.select)
      .exec(callback);
  }
}

mongoose.model('User', UserSchema);
