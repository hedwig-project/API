const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require('../config');
const uniqueValidator = require('mongoose-unique-validator');

const ModuleSchema = new Schema({
  accessPoint: {
    ip: { type: String, default: '192.168.0.20' },
    mode: { type: String, default: 'auto' },
    name: String,
    password: String, // TODO: implement some logic to obscure this
  },
  autoResetTest: { type: Boolean, default: true },
  components: {
    display: {
      type: { type: String, default: '2' },
      backlight: { type: String, default: '2' },
    },
    relay1: {
      name: { type: String, default: 'Relé 1' },
    },
    relay2: {
      name: { type: String, default: 'Relé 2' },
    },
  },
  connection: {
    ssid: String,
    password: String, // TODO: implement some logic to obscure this
  },
  location: { type: String, default: 'DEFAULT' }, // TODO maybe should be an enum of possible values
  maxMessageInterval: { type: String, default: '1:s' },
  morpheus: { type: mongoose.Schema.Types.ObjectId, ref: 'Morpheus' },
  name: String,
  qos: { type: String, default: '1' },
  serial: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

ModuleSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Module', ModuleSchema);
