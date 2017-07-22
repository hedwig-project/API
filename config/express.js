'use strict';

/**
 * Module dependencies
 */

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const csrf = require('csurf');
const cors = require('cors');
const winston = require('winston');
const methodOverride = require('method-override');
const config = require('./');
const passport = require('passport');

const env = process.env.NODE_ENV || 'development';

/**
 * Expose
 */

module.exports = function (app) {

    //CORS should be set in the future, for security issues
    app.use(cors());

    // Static files middleware
    app.use(express.static(config.root + '/public'));

    // Use winston on production
    let log = 'dev';
    if (env === 'production') {
        log = {
            stream: {
                write: message => winston.info(message)
            }
        };
    }

    // Don't log during tests
    // Loggin middleware
    if (env !== 'test') app.use(morgan(log));

    // bodyParser should be above methodOverride
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Use Passport for secure authentication
    app.use(passport.initialize());
    app.use(passport.session());

    require('./passport')(passport);

    // Method override
    app.use(methodOverride(function (req) {
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
            // Look in urlencoded POST bodies and delete it
            var method = req.body._method;
            delete req.body._method;
            return method;
        }
    }));

    if (env === 'development') {
        app.locals.pretty = true;
    }

}