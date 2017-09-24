const bluebird = require('bluebird');
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const fs = require('fs');
const http = require('http');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');
const redis = require('redis');
const socketio = require('socket.io');
const config = require('./config');
const logger = require('./logger');
const router = require('./routes');

// Mongoose models
const models = path.join(__dirname, './models');

fs
  .readdirSync(models)
  .filter(file => ~file.search(/^[^\.].*\.js$/))
  .forEach(file => require(path.join(models, file)));

// Express
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
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

if (process.env.NODE_ENV === 'development') {
  app.locals.pretty = true;
}

router(app);

// Mongo
mongoose.Promise = global.Promise;
const mongoConnection = mongoose
  .connect(config.db, {
    server: {
      socketOptions: { keepAlive: 1 },
    },
  })
  .connection;

mongoConnection
  .once('open', () => logger.info('[Mongo] Connected on port 27017'))
  .on('error', () => logger.error('[Mongo] An error occurred'));

// Redis
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const redisClient = redis.createClient();

redisClient.on('connect', () => {
  logger.info(`[Redis] Connected on port ${process.env.REDIS_PORT || 6379}`);
});

redisClient.on('error', err => {
  logger.error(`[Redis] Error: ${err.code}`);
});

// Websocket
const server = http.createServer(app);
const io = socketio(server);

io.on('connection', socket => {
  logger.info(`[Socket.io] New connection`);

  socket.on('hello', (morpheusId, cb) => {
    redisClient
      .multi()
      .set(morpheusId, socket.id)
      .set(socket.id, morpheusId)
      .execAsync()
      .then(() => logger.info(`[Redis] Saved connection information: ${morpheusId} ${socket.id}`));

    if (cb !== undefined) {
      cb('Ok');
    }
  })

  socket.on('confirmation', (data, cb) => {
    // TODO: route confirmation messages to client apps

    logger.info(`[confirmation] ${JSON.stringify(data)}`);

    if (cb !== undefined) {
      cb('Ok');
    }
  })

  socket.on('configuration', (data, cb) => {
    // TODO: get configuration

    logger.info(`[configuration] ${JSON.stringify(data)}`);

    if (cb !== undefined) {
      cb('Ok');
    }
  })

  socket.on('data', (data, cb) => {
    // TODO: transmit and persist data

    logger.info(`[data] ${JSON.stringify(data)}`);

    if (cb !== undefined) {
      cb('Ok');
    }
  });

  socket.on('confirmationReport', (data, cb) => {
    // TODO: transmit and persist data

    logger.info(`[confirmationReport] ${data}`);

    if (cb !== undefined) {
      cb('Ok');
    }
  });

  socket.on('disconnect', () => {
    logger.info(`[Socket.io] Closed connection`);
    redisClient
      .multi()
      .del(redisClient.get(socket.id))
      .del(socket.id)
      .execAsync()
      .then(() => logger.info(`[Redis] Cleaned up connection information`));
  });
});

// Debugging
app.post('/message', (req, res) => {
  logger.info(`[debug] Broadcasting a mock event of type "${req.body.type}"`);
  io.emit(req.body.type, JSON.stringify(req.body.payload));
  res.status(200).json(req.body);
});

app.post('/message/:morpheusId', (req, res) => {
  redisClient
    .getAsync(req.params.morpheusId)
    .then(socketId => {
      logger.info(`[debug] Emitting a mock event of type "${req.body.type}"`);
      io.to(socketId).emit(req.body.type, JSON.stringify(req.body.payload));
      res.status(200).json(req.body);
    });
});

// Listen
server.listen((process.env.PORT || 9090), () => {
  logger.info(`[Server] Listening on port ${process.env.PORT || 9090}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  redisClient.quit();
  io.close(() => logger.info(`[Socket.io] Closed server`));
});
