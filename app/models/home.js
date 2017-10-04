const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require('../config');

const HomeSchema = new Schema({
  address: { type: String, default: '' },
  name: { type: String },
  modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
});

module.exports = mongoose.model('Home', HomeSchema);
