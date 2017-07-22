'use strict';

/**
 * Module dependencies
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require('../../config');

/**
 * User Schema
 */

const HomeSchema = new Schema({
    address: { type: String, default: '' },
    name: { type: String },
    modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }]
});

mongoose.model('Home', HomeSchema);