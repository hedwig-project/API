const { wrap: async } = require('co');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const config = require('../config');

/**
 * Methods definitions
 */

// Rest API Methods
const create = async(function* (req, res) {
    const user = new User(req.body);
    try {
        yield user.save();
        const userView = {
            _id: user._id,
            username: user.username
        };
        const token = 'JWT ' + jwt.sign(userView, config.apiSecret(), { expiresIn: 3600 });
        return res.json({ success: true, message: 'USER_REGISTERED', token: token, response: { user: userView } });
    } catch (err) {
        const errors = Object.keys(err.errors)
            .map(field => err.errors[field].message);
        return res.json({ success: false, message: errors });
    }
});

const profile = async(function* (req, res) {
    let user = yield getUserById(req.user._id, 'username name email birthday');
    return res.json({ success: true, message: 'USER_FOUND', response: { user: user } });
});

const update = async(function* (req, res) {
    let user = yield getUserById(req.user._id);

    if (user == undefined) {
        return res.json({ success: false, message: 'ERROR_RETRIEVING_USER' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.birthday = req.body.birthday || user.birthday;

    try {
        yield User.findByIdAndUpdate(user._id, user).exec();
        return res.json({ success: true, message: 'USER_UPDATED' });
    } catch (err) {
        const errors = Object.keys(err.errors)
            .map(field => err.errors[field].message);
        return res.json({ success: false, message: errors });
    }
});

const remove = async(function* (req, res) {
    let user = yield getUserById(req.user._id);

    if (user == undefined) {
        return res.json({ success: false, message: 'ERROR_RETRIEVING_USER' });
    }

    user.active = false;

    try {
        yield User.findByIdAndUpdate(user._id, { "active": false });
        return res.json({ success: true, message: 'USER_DELETED' });
    } catch (err) {
        const errors = Object.keys(err.errors)
            .map(field => err.errors[field].message);
        return res.json({ success: false, message: errors });
    }
});

// Server Use Methods

const getUserById = function (id, select) {
    return getUserWithCriteria({ '_id': id }, select);
};

// Non Exported Methods

const getUserWithCriteria = async(function* (criteria, select) {
    let options = {};
    options.criteria = criteria;
    options.select = select;

    try {
        let user = yield User.load(options);

        if (user.length <= 0) {
            return null;
        }

        return user[0];
    } catch (err) {
        throw err;
    }
});

/**
 * Exported methods
 */
module.exports = {
    // Rest API Methods
    profile: profile,
    create: create,
    update: update,
    remove: remove,

    // Server Use Methods
    getUserById: getUserById
}
