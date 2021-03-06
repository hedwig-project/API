const mongoose = require('mongoose');
const Morpheus = require('../models/morpheus');
const utils = require('../controllers/utils');

const create = (req, res) => {
  const parameters = {
    home: req.body.home,
    modules: req.body.modules,
    resend: req.body.resend,
    serial: req.body.serial,
    user: req.body.user,
  }

  Morpheus
    .create(parameters)
    .then((morpheus) => res.json({ success: true, message: 'MORPHEUS_REGISTERED', response: { morpheus } }))
    .catch((err) => {
      return res.json({ success: false, message: err.message });
    });
};

const retrieveAll = (req, res) => {
  utils.getAll(Morpheus, function(morpheusMap){
    return res.send(morpheusMap);
  })
};

const remove = (req, res) => {
  // TODO: updated module documents
  Morpheus
    .findByIdAndRemove(req.params.id)
    .exec()
    .then((morpheus) => res.json({ success: true, message: 'MORPHEUS_DELETED', response: { morpheus } }))
    .catch((err) => {
      return res.json({ success: false, message: err.message });
    });
};

const retrieve = (req, res) => {
  Morpheus
    .findById(req.params.id)
    .exec()
    .then((morpheus) => res.json({ success: true, message: 'MORPHEUS_FOUND', response: { morpheus } }))
    .catch((err) => {
      return res.json({ success: false, message: err.message });
    });
};

const update = (req, res) => {
  const parameters = {
    home: req.body.home,
    modules: req.body.modules,
    resend: req.body.resend,
    serial: req.body.serial,
    user: req.body.user,
  }

  Morpheus
    .findByIdAndUpdate(req.params.id, parameters, { new: true })
    .exec()
    .then((morpheus) => res.json({ success: true, message: 'MORPHEUS_UPDATED', response: { morpheus } }))
    .catch((err) => {
      return res.json({ success: false, message: err.message });
    });
};

const retrieveModules = (req, res) => {
  Morpheus
    .findById(req.params.id)
    .populate('modules')
    .exec()
    .then((morpheus) => res.json({ success: true, message: 'MORPHEUS_MODULES_FOUND', response: { modules: morpheus.modules } }))
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
  retrieveModules,
}
