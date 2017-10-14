const mongoose = require('mongoose');
const Module = require('../models/module');
const Morpheus = require('../models/morpheus');

const create = (req, res) => {
  const parameters = {
    components: req.body.components,
    location: req.body.location,
    name: req.body.name,
    serial: req.body.serial,
    qos: req.body.qos,
  }

  Module
    .create(parameters)
    .then((module) => {
      return Morpheus
        .findByIdAndUpdate(req.body.morpheusId, { '$push': { 'modules': module } })
        .exec()
        .then(() => module);
    })
    .then((module) => res.json({ success: true, message: 'MODULE_REGISTERED', response: { module } }))
    .catch((err) => {
      return res.json({ success: false, message: err.message });
    });
};

const remove = (req, res) => {
  // TODO
};

const retrieve = (req, res) => {
  // TODO
};

const update = (req, res) => {
  // TODO
};

module.exports = {
  create,
  remove,
  retrieve,
  update,
}
