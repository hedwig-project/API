const passport = require('passport');
const router = require('express').Router();
const auth = require('../../controllers/auth');
const users = require('../../controllers/users');

module.exports = () => {
  router
    .route('/profile')
    .get(passport.authenticate('jwt', { session: false }), users.profile);

  router
    .route('/register')
    .post(users.create);

  router
    .route('/authenticate')
    .post(auth.authenticate);

  router
    .route('/update')
    .put(passport.authenticate('jwt', { session: false }), users.update);

  router
    .route('/delete')
    .delete(passport.authenticate('jwt', { session: false }), users.remove);

  return router;
};
