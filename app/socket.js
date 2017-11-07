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

    socket.on('hello', (morpheusId, data, cb) => {
      const id = JSON.parse(data);
      const socketLabel = id.type === 'morpheus' ? 'morpheus' : socket.id;

      redisClient
        .multi()
        .hmset(id.morpheusId, socketLabel, socket.id)
        .hmset(socket.id, id.morpheusId, id.morpheusId, "type", id.type)
        .execAsync()
        .then(() => logger.info(`[Redis] Saved ${id.type} connection information: morpheusId: ${id.morpheusId}, socketId: ${socket.id}`))
        .then(() => {
          redisClient
            .hgetallAsync(id.morpheusId)
            .then((data) => {
              if (socketLabel === 'morpheus') {
                Object
                  .keys(data)
                  .filter((socketId) => socketId !== 'morpheus')
                  .map((socketId) => {
                    io.to(socketId).emit('hello', id.morpheusId);
                    logger.info(`[hello] Event emitted successfully to ${socketId}`);
                  });
              } else if (data.morpheus){
                io.to(socket.id).emit('hello', id.morpheusId);
                logger.info(`[hello] Event emitted successfully to ${socket.id}`);
              }
            });
        });

      if (cb !== undefined) {
        cb('Ok');
      }
    });

    socket.on('action', (morpheusId, data, cb) => {
      redisClient
        .hgetAsync(morpheusId, 'morpheus')
        .then((morpheusSocket) => {
          if (morpheusSocket) {
            io.to(morpheusSocket).emit('action', morpheusId, JSON.stringify(data));
            logger.info(`[action] Event emitted successfully to ${morpheusSocket}`);
          }
        });

      logger.info(`[action] ${JSON.stringify(data)}`);

      if (cb !== undefined) {
        cb('Ok');
      }
    });

    socket.on('confirmation', (morpheusId, data, cb) => {
      redisClient
        .hgetallAsync(morpheusId)
        .then((morpheus) => {
          Object.keys(morpheus).map((socketId) => {
            if (socketId !== 'morpheus') {
              io.to(socketId).emit('confirmation', morpheusId, JSON.parse(data));
              logger.info(`[confirmation] Event emitted successfully to ${socketId}`);
            }
          });
        });

      logger.info(`[confirmation] ${data}`);

      if (cb !== undefined) {
        cb('Ok');
      }
    });

    socket.on('configuration', (morpheusId, data, cb) => {
      redisClient
        .hgetAsync(morpheusId, 'morpheus')
        .then((morpheusSocket) => {
          if (morpheusSocket && socket.id !== morpheusSocket) {
            io.to(morpheusSocket).emit('configuration', morpheusId, JSON.stringify(data));
            logger.info(`[configuration] Event emitted successfully to ${morpheusSocket}`);
          } else {
            // TODO: send configuration to Morpheus
          }
        });

      logger.info(`[configuration] ${JSON.stringify(data)}`);

      if (cb !== undefined) {
        cb('Ok');
      }
    });

    socket.on('data', (morpheusId, data, cb) => {
      redisClient
        .hgetallAsync(morpheusId)
        .then((morpheus) => {
          Object.keys(morpheus).map((socketId) => {
            if (socketId !== 'morpheus') {
              io.to(socketId).emit('data', morpheusId, JSON.parse(data));
              logger.info(`[data] Event emitted successfully to ${socketId}`);
            }
          });
        });

      db.saveData(JSON.parse(data));
      logger.info(`[data] ${data}`);

      if (cb !== undefined) {
        cb('Ok');
      }
    });

    socket.on('report', (morpheusId, data, cb) => {
      redisClient
        .hgetallAsync(morpheusId)
        .then((morpheus) => {
          Object.keys(morpheus).map((socketId) => {
            if (socketId !== 'morpheus') {
              io.to(socketId).emit('report', morpheusId, JSON.parse(data));
              logger.info(`[report] Event emitted successfully to ${socketId}`);
            }
          });
        });

      db.saveConfirmationReport(JSON.parse(data));
      logger.info(`[report] ${data}`);

      if (cb !== undefined) {
        cb('Ok');
      }
    });

    socket.on('disconnect', () => {
      logger.info(`[Socket.io] Closed connection`);
      redisClient
        .hgetallAsync(socket.id)
        .then((data) => {
          if (data.type === 'morpheus') {
            const morpheusId = Object.keys(data).filter((key) => key !== 'type')[0]
            redisClient
              .hgetallAsync(morpheusId)
              .then((morpheus) => {
                Object.keys(morpheus).map((socketId) => {
                  if (socketId !== 'morpheus') {
                    io.to(socketId).emit('bye', morpheusId);
                    logger.info(`[bye] Event emitted successfully to ${socketId}`);
                  }
                });
              });
          }

          return data;
        })
        .then((data) => {
          const promises = Object.keys(data)
            .filter((key) => key !== 'type')
            .map((morpheusId) => redisClient.hdelAsync(morpheusId, socket.id));

          return Promise.all(promises);
        })
        .then(() => redisClient.delAsync(socket.id))
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
      .hgetAsync(req.params.morpheusId, 'morpheus')
      .then(socketId => {
        if (socketId) {
          logger.info(`[debug] Emitting a mock event of type "${req.body.type}"`);
          io.to(socketId).emit(req.body.type, JSON.stringify(req.body.payload));
          res.status(200).json(req.body);
        }
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
