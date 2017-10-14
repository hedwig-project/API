const passport = require('passport');
const router = require('express').Router();
const auth = require('../controllers/auth');
const modules = require('../controllers/modules');

module.exports = () => {
  router
    .route('/')
    .get(modules.retrieveAll) // TODO remove this, it's here for simplifying testing only
    .post(passport.authenticate('jwt', { session: false }), modules.create);

  router
    .route('/:id')
    .get(passport.authenticate('jwt', { session: false }), modules.retrieve)
    .put(passport.authenticate('jwt', { session: false }), modules.update)
    .delete(passport.authenticate('jwt', { session: false }), modules.remove);

  return router;
};
