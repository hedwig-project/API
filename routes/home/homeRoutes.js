'use strict';

/**
 * Module dependencies
 */

const home = require('../../app/controllers/home');
const auth = require('../../app/controllers/auth');
const passport = require('passport');
const router = require('express').Router();

/**
 * Expose routes
 */

module.exports = function () {

    /**
     * Routes
     */

    router.route('/list')
        .get(passport.authenticate('jwt', { session: false }), home.listHomes);

    router.route('/detail')
        .get(passport.authenticate('jwt', { session: false }), home.detailHome);

    router.route('/create')
        .post(passport.authenticate('jwt', { session: false }), home.create);

    router.route('/addModule')
        .post(passport.authenticate('jwt', { session: false }), home.addModule);

    router.route('/update')
        .put(passport.authenticate('jwt', { session: false }), home.update);

    router.route('/delete')
        .delete(passport.authenticate('jwt', {session: false}), home.remove);

    router.route('/deleteModule')
        .delete(passport.authenticate('jwt', {session: false}), home.removeModule);

    return router;
}



