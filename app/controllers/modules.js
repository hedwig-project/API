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
    user: req.body.userId,
  }

  Module
    .create(parameters)
    .then((module) => {
      return Morpheus
        .findByIdAndUpdate(req.body.morpheusId, { '$push': { 'modules': module._id } })
        .exec()
        .then((morpheus) => ({
          name: module.name,
          location: module.location,
          serial: module.serial,
          qos: module.qos,
          _id: module._id,
          components: module.components,
          morpheus: {
            _id: morpheus._id,
            serial: morpheus.serial,
          },
        }));
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
  Module
    .findByIdAndRemove(req.params.id)
    .populate('morpheus', 'serial')
    .exec()
    .then((module) => {
      return Morpheus
        .findByIdAndUpdate(module.morpheus, { '$pull': { 'modules': module._id } })
        .exec()
        .then(() => module);
    })
    .then((module) => res.json({ success: true, message: 'MODULE_DELETED', response: { module } }))
    .catch((err) => {
      return res.json({ success: false, message: err.message });
    });
};

const retrieve = (req, res) => {
  Module
    .findById(req.params.id)
    .populate('morpheus', 'serial')
    .exec()
    .then((module) => res.json({ success: true, message: 'MODULE_FOUND', response: { module } }))
    .catch((err) => {
      return res.json({ success: false, message: err.message });
    });
};

const update = (req, res) => {
  const parameters = {
    components: req.body.components,
    location: req.body.location,
    morpheus: req.body.morpheusId,
    name: req.body.name,
    serial: req.body.serial,
    qos: req.body.qos,
    user: req.body.userId,
  }

  Module
    .findByIdAndUpdate(req.params.id, parameters, { new: true })
    .populate('morpheus', 'serial')
    .exec()
    .then((module) => res.json({ success: true, message: 'MODULE_UPDATED', response: { module } }))
    .catch((err) => {
      return res.json({ success: false, message: err.message });
    });
};

module.exports = {
  create,
  retrieveAll,
  remove,
  retrieve,
  update,
}
