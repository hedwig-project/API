const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require('../config');

const ModuleSchema = new Schema({
  components: {
    relay1: {
      name: String,
    },
    relay2: {
      name: String,
    },
  },
  location: String, // TODO maybe should be an enum of possible values
  maxMessageInterval: String,
  name: String,
  qos: String,
  serial: String,
});

module.exports = mongoose.model('Module', ModuleSchema);
