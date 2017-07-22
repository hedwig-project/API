'use strict';

/**
 * Configuration of Passport module
 */

/**
 * Module dependencies
 */

const jwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const users = require('../app/controllers/users');
const config = require('./');

module.exports = function (passport) {
    let opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
    opts.secretOrKey = config.apiSecret();
    passport.use(new jwtStrategy(opts, (jwt_payload, done) => {
        users.getUserById(jwt_payload._id, '_id username email name active')
            .then((user) => {
                if (user) {
                    if(user.active)
                        return done(null, user);
                    else {
                        return done(null, false);
                    }
                } else {
                    return done(null, false);
                }
            })
            .catch((err) => {
                return done(err, false);
            });
    }));
}