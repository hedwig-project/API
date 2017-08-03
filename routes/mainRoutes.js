'use strict';

/**
 * Module dependencies
 */

const router = require('express').Router();
const { wrap: async } = require('co');

/**
 * Expose routes
 */

const placeholderFunction = async(function* (req, res) {
    return res.status(200).send('Placeholder response');
});

module.exports = function () {

    /**
     * Routes
     */

    router.route('/confirmation')
        .post(placeholderFunction);

    router.route('/configuration')
        .post(placeholderFunction);

    router.route('/data_transmission')
        .post(placeholderFunction);

    return router;
}



