const passport = require('passport');
const router = require('express').Router();
const auth = require('../controllers/auth');
const users = require('../controllers/users');

module.exports = () => {
  router
    .route('/')
    .get(users.retrieveAll) // TODO remove this, it's here for simplifying testing only
    .post(users.create);

  router
    .route('/authenticate')
    .post(auth.authenticate);

  router
    .route('/profile')
    .get(passport.authenticate('jwt', { session: false }), users.profile)

  router
    .route('/:id')
    .get(passport.authenticate('jwt', { session: false }), users.profile)
    .put(passport.authenticate('jwt', { session: false }), users.update)
    .delete(passport.authenticate('jwt', { session: false }), users.remove);

  router
    .route('/:id/modules')
    .get(passport.authenticate('jwt', { session: false }), users.getModules);

  router
    .route('/:id/morpheus')
    .get(passport.authenticate('jwt', { session: false }), users.getMorpheus);

  return router;
};
