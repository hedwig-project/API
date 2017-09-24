const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require('../config');

const ModuleSchema = new Schema({
  location: { type: String },
  name: { type: String },
  serial: { type: String },
});

mongoose.model('Module', ModuleSchema);
