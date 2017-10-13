const bluebird = require('bluebird');
const http = require('http');
const redis = require('redis');
const socketio = require('socket.io');
const db = require('./models/message');
const logger = require('./logger');

module.exports = (app) => {
  // Redis
  bluebird.promisifyAll(redis.RedisClient.prototype);
  bluebird.promisifyAll(redis.Multi.prototype);

  const redisClient = redis.createClient({
    retry_strategy: (options) => {
      if (options.attempt > 10) {
        return undefined; // End reconnecting with built in error
      }
      return Math.min(options.attempt * 100, 3000); // Reconnect after
    }
  });

  redisClient.on('connect', () => {
    logger.info(`[Redis] Connected on port ${process.env.REDIS_PORT || 6379}`);
  });

  redisClient.on('error', err => {
    logger.error(`[Redis] Error: ${err}`);
  });

  // Websocket
  const server = http.createServer(app);
  const io = socketio(server);

  io.on('connection', socket => {
    logger.info(`[Socket.io] New connection`);

    socket.on('hello', (data, cb) => {
      const id = JSON.parse(data);

      // TODO: can multiple instances of same type connect to socket.io server?
      redisClient
        .multi()
        .hmset(id.morpheusId, id.type, socket.id)
        .hmset(socket.id, "morpheusId", id.morpheusId, "type", id.type)
        .execAsync()
        .then(() => logger.info(`[Redis] Saved ${id.type} connection information: ${id.morpheusId} ${socket.id}`));

      if (cb !== undefined) {
        cb('Ok');
      }
    });

    socket.on('actionRequest', (data, cb) => {
      redisClient
        .hgetallAsync(socket.id)
        .then((id) => {
          return redisClient.hgetallAsync(id.morpheusId);
        })
        .then((id) => {
          if (id.morpheus) {
            io.to(id.morpheus).emit('actionRequest', JSON.stringify(data));
            logger.info(`[actionRequest] Event emitted successfully to ${id.morpheus}`);
          }
        });

      logger.info(`[actionRequest] ${JSON.stringify(data)}`);

      if (cb !== undefined) {
        cb('Ok');
      }
    });

    socket.on('confirmation', (data, cb) => {
      redisClient
        .hgetallAsync(socket.id)
        .then((id) => {
          return redisClient.hgetallAsync(id.morpheusId);
        })
        .then((id) => {
          if (id.dashboard) {
            io.to(id.dashboard).emit('confirmation', JSON.parse(data));
            logger.info(`[confirmation] Event emitted successfully to ${id.dashboard}`);
          }
        });

      logger.info(`[confirmation] ${data}`);

      if (cb !== undefined) {
        cb('Ok');
      }
    });

    socket.on('configuration', (data, cb) => {
      // TODO: get configuration

      logger.info(`[configuration] ${data}`);

      if (cb !== undefined) {
        cb('Ok');
      }
    });

    socket.on('data', (data, cb) => {
      redisClient
        .hgetallAsync(socket.id)
        .then((id) => {
          return redisClient.hgetallAsync(id.morpheusId);
        })
        .then((id) => {
          if (id.dashboard) {
            io.to(id.dashboard).emit('data', JSON.parse(data));
            logger.info(`[data] Event emitted successfully to ${id.dashboard}`);
          }
        });

      db.saveData(JSON.parse(data));
      logger.info(`[data] ${data}`);

      if (cb !== undefined) {
        cb('Ok');
      }
    });

    socket.on('confirmationReport', (data, cb) => {
      redisClient
        .hgetallAsync(socket.id)
        .then((id) => {
          return redisClient.hgetallAsync(id.morpheusId);
        })
        .then((id) => {
          if (id.dashboard) {
            io.to(id.dashboard).emit('confirmationReport', JSON.parse(data));
            logger.info(`[confirmationReport] Event emitted successfully to ${id.dashboard}`);
          }
        });

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
    io.close(() => {
      logger.info(`[Socket.io] Closed server`);
      redisClient
        .flushallAsync()
        .then(() => {
          logger.info(`[Redis] Flushed all connection information`)
          return redisClient.quitAsync();
        })
        .then(() => process.exit());
    });
  });

  return server;
};
