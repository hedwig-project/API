const passport = require('passport');
const router = require('express').Router();
const auth = require('../controllers/auth');
const morpheus = require('../controllers/morpheus');

module.exports = () => {
  router
    .route('/')
    .post(passport.authenticate('jwt', { session: false }), morpheus.create);

  router
    .route('/:id')
    .get(passport.authenticate('jwt', { session: false }), morpheus.retrieve)
    .put(passport.authenticate('jwt', { session: false }), morpheus.update)
    .delete(passport.authenticate('jwt', { session: false }), morpheus.remove);

  router
    .route('/:id/modules')
    .get(passport.authenticate('jwt', { session: false }), morpheus.retrieveModules);

  return router;
};
