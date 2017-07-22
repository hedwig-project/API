'use strict';

/** 
 * Module dependencies
 */

const path = require('path');

const production = require('./env/production');
const development = require('./env/development');
const test = require('./env/test');

const defaults = {
    root: path.join(__dirname, '..')
};

/**
 * Expose
 */

var environments = {
    production: Object.assign(production, defaults),
    development: Object.assign(development, defaults),
    test: Object.assign(test, defaults)
}

module.exports = environments[process.env.NODE_ENV || 'development'];