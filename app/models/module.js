const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require('../config');

const ModuleSchema = new Schema({
  location: { type: String },
  name: { type: String },
  serial: { type: String },
});

module.exports = mongoose.model('Module', ModuleSchema);
