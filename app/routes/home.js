const passport = require('passport');
const router = require('express').Router();
const auth = require('../../controllers/auth');
const home = require('../../controllers/home');

module.exports = () => {
  router
    .route('/list')
    .get(passport.authenticate('jwt', { session: false }), home.listHomes);

  router
    .route('/detail')
    .get(passport.authenticate('jwt', { session: false }), home.detailHome);

  router
    .route('/create')
    .post(passport.authenticate('jwt', { session: false }), home.create);

  router
    .route('/addModule')
    .post(passport.authenticate('jwt', { session: false }), home.addModule);

  router
    .route('/update')
    .put(passport.authenticate('jwt', { session: false }), home.update);

  router
    .route('/delete')
    .delete(passport.authenticate('jwt', { session: false }), home.remove);

  router
    .route('/deleteModule')
    .delete(passport.authenticate('jwt', { session: false }), home.removeModule);

  return router;
}
