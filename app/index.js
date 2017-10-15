const bluebird = require('bluebird');
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const fs = require('fs');
const http = require('http');
const https = require('https');

const methodOverride = require('method-override');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');
const config = require('./config');
const logger = require('./logger');
const router = require('./routes');
const socketio = require('./socket');

/*
 * Express
 */
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const passport = require('./passport');
app.use(passport.initialize());
app.use(passport.session());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(methodOverride((req) => {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // Look in urlencoded POST bodies and delete it
    const method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

if (process.env.NODE_ENV === 'development') {
  app.locals.pretty = true;
}

router(app);

/*
 * Mongo
 */
mongoose.Promise = bluebird;
const mongooseConnection = mongoose
  .connect(config.db, {
    server: {
      socketOptions: { keepAlive: 1 },
    },
  })
  .connection;

mongooseConnection
  .once('open', () => logger.info('[MongoDB] Connected on port 27017'))
  .on('error', () => logger.error('[MongoDB] An error occurred'));

/*
 * Socket.io server
 */
const server = socketio(app);

server.listen((process.env.PORT || 9090), () => {
  logger.info(`[Server] Listening on port ${process.env.PORT || 9090}`);
});

const privateKey  = fs.readFileSync(path.resolve('app/config/sslcert/key.pem'));
const certificate = fs.readFileSync(path.resolve('app/config/sslcert/cert.pem'));
const credentials = {key: privateKey, cert: certificate};
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(8443);
