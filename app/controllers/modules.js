const mongoose = require('mongoose');
const Module = require('../models/module');
const Morpheus = require('../models/morpheus');
const utils = require('../controllers/utils');

const create = (req, res) => {
  const parameters = {
    components: req.body.components,
    location: req.body.location,
    morpheus: req.body.morpheusId,
    name: req.body.name,
    serial: req.body.serial,
    qos: req.body.qos,
  }

  Module
    .create(parameters)
    .then((module) => {
      return Morpheus
        .findByIdAndUpdate(req.body.morpheusId, { '$push': { 'modules': module } }) // TODO maybe it should be module.id
        .exec()
        .then(() => module);
    })
    .then((module) => res.json({ success: true, message: 'MODULE_REGISTERED', response: { module } }))
    .catch((err) => {
      return res.json({ success: false, message: err.message });
    });
};

const retrieveAll = (req, res) => {
  utils.getAll(Module, function(modulesMap){
    return res.send(modulesMap);
  })
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
  retrieveAll,
  remove,
  retrieve,
  update,
}
