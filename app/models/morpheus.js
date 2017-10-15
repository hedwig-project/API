const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require('../config');
const uniqueValidator = require('mongoose-unique-validator');

const MorpheusSchema = new Schema({
  home: { type: mongoose.Schema.Types.ObjectId, ref: 'Home' },
  modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
  resend: { type: Boolean },
  serial: { type: String, unique: true  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

MorpheusSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Morpheus', MorpheusSchema);
