'use strict';

/**
 * Authorization and registration module for Hedwig
 */

/**
 * Module dependencies
 */

//Loader of environment variables to process.env
require('dotenv').config();

const fs = require('fs');
const join = require('path').join;
const mongoose = require('mongoose');
const express = require('express');
const config = require('./config');

const models = join(__dirname, 'app/models');
const port = process.env.PORT || 3000;
const app = express();

/**
 * Expose
 */

module.exports = app;

// Boostrap models
fs.readdirSync(models)
    .filter(file => ~file.search(/^[^\.].*\.js$/))
    .forEach(file => require(join(models, file)));

// Bootstrap routes
require('./config/express')(app);
require('./routes/router')(app);

/**
 * Managing functions
 */

const listen = function () {
    if (app.get('env') === 'test') return;

    app.listen(port);
    console.log('Express app started on port ' + port);
};

const connect = function () {
    var options = {
        server: {
            socketOptions: {
                keepAlive: 1
            }
        }
    };

    mongoose.Promise = global.Promise;
    return mongoose.connect(config.db, options).connection;
};

/**
 * Execution
 */

connect()
    .on('error', console.log)
    .on('disconnected', connect)
    .once('open', listen);