const bcrypt = require('bcryptjs');
const { wrap: async } = require('co');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/user');
const config = require('../config');

/**
 * Authenticate
 */
exports.authenticate = async(function* (req, res) {
  let criteria = {};
  let isEmail = /@/;

  if (isEmail.test(req.body.username)) {
    criteria.email = req.body.username;
  } else {
    criteria.username = req.body.username;
  }

  try {
    let select = '_id username name email hashed_password active';

    let user = yield User.load({ criteria, select });

    if (user.length === 0 || !user[0].active) {
      return res.status(401).json({ success: false, message: 'INVALID_CREDENTIALS' });
    }

    const userView = {
      _id: user[0]._id,
      username: user[0].username,
      name: user[0].name,
      email: user[0].email
    };

    bcrypt
      .compare(req.body.password, user[0].hashed_password)
      .then((match) => {
        if (match) {
          let token = 'JWT ' + jwt.sign(userView, config.apiSecret(), { expiresIn: 3600 });
          return res.json({ success: true, message: 'USER_LOGGED_IN', token: token, response: { user: userView } });
        } else {
          return res.status(401).json({ success: false, message: 'INVALID_CREDENTIALS' });
        }
      })
      .catch((err) => {
        return res.status(401).json({ success: false, message: 'INVALID_CREDENTIALS' });
      });
  } catch (err) {
    let errors = [];
    if (Array.isArray(err)) {
      errors = Object.keys(err)
        .map(field => err.errors[field].message);
    } else {
      errors.push(err.message);
    }
    res.status(500).json({ success: false, message: errors });
  }
});
