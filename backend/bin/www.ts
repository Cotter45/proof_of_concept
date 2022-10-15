/**
 * Module dependencies.
 */

import 'module-alias/register';
import { config } from 'dotenv';
config();

import app from '../src/app';
import Debug from 'debug';
import http from 'http';
import cluster from 'cluster';

import { db, seedData } from '../src/config/db';

const debug = Debug('ts-express-sql:server');
import { bootstrapLogger } from '../src/utils/loggers';
bootstrapLogger();

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

db.connect().then(async (client: any) => {
  console.log('Connected to database');
  await seedData(client);

  if (cluster.isPrimary) {
    console.log(`Master ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < 2; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
    });
  } else {
    server.listen(port, () => console.log('🚀 ~ server launch  ~ port', port));
    server.on('error', onError);
    server.on('listening', onListening);
  }
});


/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: string) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: { syscall: string, code: string }) {
  if (error.syscall !== 'listen') {
    db.end();
    throw error;
  }

  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      db.end();
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      db.end();
      process.exit(1);
      break;
    default:
      db.end();
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr?.port;
  debug('Listening on ' + bind);
}
