const bluebird = require('bluebird');
const http = require('http');
const redis = require('redis');
const socketio = require('socket.io');
const db = require('./models/morpheus');
const logger = require('./logger');

module.exports = (app) => {
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

    socket.on('hello', (data, cb) => {
      const id = JSON.parse(data);

      redisClient
        .multi()
        .hmset(id.morpheusId, id.type, socket.id)
        .hmset(socket.id, "morpheusId", id.morpheusId, "type", id.type)
        .execAsync()
        .then(() => logger.info(`[Redis] Saved ${id.type} connection information: ${id.morpheusId} ${socket.id}`));

      if (cb !== undefined) {
        cb('Ok');
      }
    })

    socket.on('confirmation', (data, cb) => {
      // TODO: route confirmation messages to client apps

      logger.info(`[confirmation] ${data}`);

      if (cb !== undefined) {
        cb('Ok');
      }
    })

    socket.on('configuration', (data, cb) => {
      // TODO: get configuration

      logger.info(`[configuration] ${data}`);

      if (cb !== undefined) {
        cb('Ok');
      }
    })

    socket.on('data', (data, cb) => {
      // TODO: transmit data

      db.saveData(JSON.parse(data));
      logger.info(`[data] ${data}`);

      if (cb !== undefined) {
        cb('Ok');
      }
    });

    socket.on('confirmationReport', (data, cb) => {
      // TODO: transmit data

      db.saveConfirmationReport(JSON.parse(data));
      logger.info(`[confirmationReport] ${data}`);

      if (cb !== undefined) {
        cb('Ok');
      }
    });

    socket.on('disconnect', () => {
      logger.info(`[Socket.io] Closed connection`);
      redisClient
        .hgetallAsync(socket.id)
        .then((data) => {
          return redisClient
            .multi()
            .hdel(data.morpheusId, data.type)
            .del(socket.id)
            .execAsync();
        })
        .then(() => logger.info(`[Redis] Cleaned up connection information`));
    });
  });

  // Debug endpoints
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

  // Graceful shutdown
  process.on('SIGINT', () => {
    redisClient.quit(); // TODO: Delete all connections information and gracefully exit
    io.close(() => logger.info(`[Socket.io] Closed server`));
  });

  return server;
};
