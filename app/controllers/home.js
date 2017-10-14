const { wrap: async } = require('co');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Home = require('../models/home');
const Module = require('../models/module');
const User = require('../models/user');
const Users = require('../controllers/users');
const config = require('../config');
const utils = require('../controllers/utils');

/**
 * Methods definitions
 */

// Rest API Methods
const retrieveAll = (req, res) => {
  utils.getAll(Home, function(homesMap){
    return res.send(homesMap);
  })
};

const create = async(function* (req, res) {
    let homeParameters = {
        name: req.body.name || '',
        address: req.body.address || ''
    }

    const home = new Home(homeParameters);
    yield home.save();

    try {
        yield User.findByIdAndUpdate({ '_id': req.user._id }, {
            '$push': {
                'homes': home
            }
        }).exec();
        return res.json({ success: true, message: 'HOME_REGISTERED', response: { home: home } });
    } catch (err) {
        const errors = Object.keys(err.errors)
            .map(field => err.errors[field].message);
        return res.json({ success: false, message: errors });
    }
});

const update = async(function* (req, res) {
    let home = yield findHome(req.user, req.query.homeId);
    try {
        if (home != null) {
            try {
                home.name = req.body.name || home.name;
                home.address = req.body.address || home.address;

                yield Home.findByIdAndUpdate(home._id, {
                    'name': req.body.name || home.name,
                    'address': req.body.address || home.address
                }).exec();

                return res.json({ success: true, message: 'HOME_UPDATED' });
            } catch (err) {
                return res.json({ success: false, message: 'ERROR_UPDATING' });
            }

        } else {
            return res.json({ success: false, message: 'NONE_FOUND' });
        }
    } catch (err) {
        return res.json({ success: false, message: 'ERR_IN_SEARCH' });
    }
});

const remove = async(function* (req, res) {
    try {
        let success = yield deleteHome(req.user, req.query.homeId);
        if (success) {
            return res.json({ success: true, message: 'HOME_DELETED' });
        } else {
            return res.json({ success: false, message: 'NONE_FOUND' });
        }
    } catch (err) {
        return res.json({ success: false, message: 'ERR_IN_DELETE' });
    }
});

const removeModule = async(function* (req, res) {
    try {
        let success = yield deleteModule(req.user, req.query.homeId, req.query.moduleId);
        if (success) {
            return res.json({ success: true, message: 'MODULE_DELETED' });
        } else {
            return res.json({ success: false, message: 'NONE_FOUND' });
        }
    } catch (err) {
        return res.json({ success: false, message: 'ERR_IN_DELETE' });
    }
});


const addModule = async(function* (req, res) {
    let home = yield findHome(req.user, req.query.homeId || '');
    try {
        if (home != null) {
            let moduleParameters = {
                name: req.body.name,
                location: req.body.location,
                serial: req.body.serial
            }

            let module = new Module(moduleParameters);
            module.save();

            yield Home.findByIdAndUpdate({ '_id': home._id }, {
                '$push': {
                    'modules': module
                }
            }).exec();
            return res.json({
                success: true, message: 'MODULE_ADDED', module: {
                    "name": module.name,
                    "location": module.location,
                    "serial": module.serial
                }
            });
        } else {
            return res.json({ success: false, message: 'HOME_NOT_FOUND' });
        }
    } catch (err) {
        return res.json({ success: false, message: 'ERR_IN_SEARCH' });
    }
});

const listHomes = async(function* (req, res) {
    let homes = yield allHomes(req.user);
    try {
        if (homes != null) {
            return res.json({ success: true, message: 'HOMES_FOUND', response: { homes: homes } });
        } else {
            return res.json({ success: false, message: 'NONE_FOUND' });
        }
    } catch (err) {
        return res.json({ success: false, message: 'ERR_IN_SEARCH' });
    }
});

const detailHome = async(function* (req, res) {
    let home = yield findHome(req.user, req.query.homeId);
    try {
        if (home != null) {
            return res.json({ success: true, message: 'HOME_FOUND', response: { home: home } });
        } else {
            return res.json({ success: false, message: 'NONE_FOUND' });
        }
    } catch (err) {
        return res.json({ success: false, message: 'ERR_IN_SEARCH' });
    }
});

// Server Use Methods

// Non Exported Methods

const findHome = async(function* (user, homeId) {
    if (!homeId.match(/^[0-9a-fA-F]{24}$/))
        return null;

    let foundUser = yield User.find({
        '_id': user._id,
        'homes': {
            '$in': [homeId]
        }
    });

    if (foundUser.length == 0) {
        return null;
    }

    return yield User.findOne({ _id: user._id })
        .select('homes')
        .populate({
            path: 'homes',
            match: { '_id': homeId },
            populate: {
                path: 'modules'
            }
        })
        .populate('modules')
        .exec()
        .then((user) => {
            return user.homes[0];
        })
        .catch((err) => {
            throw err;
        });
});

const allHomes = async(function* (user, selectFields) {
    return yield User.findOne({ _id: user._id })
        .select('homes')
        .populate({
            path: 'homes',
            select: '-modules'
        })
        .exec()
        .then((user) => {
            return user.homes;
        })
        .catch((err) => {
            throw err;
        });
});

const deleteHome = async(function* (user, homeId) {
    if (!homeId.match(/^[0-9a-fA-F]{24}$/))
        return false;

    let foundUser = yield User.find({
        '_id': user._id,
        'homes': {
            '$in': [homeId]
        }
    });

    if (foundUser.length == 0) {
        return false;
    }

    yield Home.findByIdAndRemove(homeId);

    yield User.findByIdAndUpdate(user._id,
        {
            '$pull': {
                'homes': homeId
            }
        });

    return true;
});

const deleteModule = async(function* (user, homeId, moduleId) {
    if (!homeId.match(/^[0-9a-fA-F]{24}$/))
        return false;

    let foundUser = yield User.find({
        '_id': user._id,
        'homes': {
            '$in': [homeId]
        }
    });

    if (foundUser.length == 0) {
        return false;
    }

    let foundHome = yield Home.find({
        '_id': homeId,
        'modules': {
            '$in': [moduleId]
        }
    });

    if (foundHome.length == 0) {
        return false;
    }

    yield Module.findByIdAndRemove(moduleId);

    yield Home.findByIdAndUpdate(homeId,
        {
            '$pull': {
                'modules': moduleId
            }
        });

    return true;
});

/**
 * Exported methods
 */
module.exports = {
    // Rest API Methods
    retrieveAll: retrieveAll,
    listHomes: listHomes,
    detailHome: detailHome,
    create: create,
    addModule: addModule,
    update: update,
    remove: remove,
    removeModule: removeModule

    // Server Use Methods
}
