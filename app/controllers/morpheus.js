const mongoose = require('mongoose');
const Morpheus = require('../models/morpheus');

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

const remove = (req, res) => {
  // TODO
};

const retrieve = (req, res) => {
  // TODO
};

const update = (req, res) => {
  // TODO
};

const retrieveModules = (req, res) => {
  // TODO
};

module.exports = {
  create,
  remove,
  retrieve,
  update,
  retrieveModules,
}
