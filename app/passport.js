const passport = require('passport');
const jwtExtract = require('passport-jwt').ExtractJwt;
const jwtStrategy = require('passport-jwt').Strategy;
const config = require('./config/');
const users = require('./controllers/users');

const opts = {
  jwtFromRequest: jwtExtract.fromAuthHeader(),
  secretOrKey: config.apiSecret(),
};

passport.use(
  new jwtStrategy(opts, (jwt_payload, done) => {
    users
      .getUserById(jwt_payload._id, '_id username email name active')
      .then((user) => {
        if (user) {
          if(user.active) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        } else {
          return done(null, false);
        }
      })
      .catch((err) => {
        return done(err, false);
      });
  })
);

module.exports = passport;
