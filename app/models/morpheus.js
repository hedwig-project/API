const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require('../config');

const MorpheusSchema = new Schema({
  home: { type: mongoose.Schema.Types.ObjectId, ref: 'Home' },
  modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
  resend: { type: Boolean },
  serial: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Morpheus', MorpheusSchema);
