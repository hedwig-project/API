const homeRouter = require('./home');
const modulesRouter = require('./modules');
const morpheusRouter = require('./morpheus');
const usersRouter = require('./users');
const logger = require('../logger');

module.exports = (app) => {
  app.get('/health', (req, res) => {
    res.send('OK');
  });

  app.get('/info', (req, res) => {  // Workaround to make Morpheus integration work
    res.send('OK');
  });

  app.use('/homes', homeRouter());
  app.use('/modules', modulesRouter());
  app.use('/morpheus', morpheusRouter());
  app.use('/users', usersRouter());

  app.use((err, req, res, next) => {
    // Treat as 404
    if (err.message
      && (~err.message.indexOf('not found')
        || (~err.message.indexOf('Cast to ObjectId failed')))) {
      return next();
    }

    logger.error(err.stack);

    if (err.stack.includes('ValidationError')) {
      res.status(422);
      return;
    }
  });
};
