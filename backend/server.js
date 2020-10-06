#!/usr/bin/env node

/**
 * Module dependencies.
 */
var app = require('./app');
var debug = require('debug')('pay-pulse');
var http = require('http');
// var https = require('https');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);
// app.set('secPort',port+443);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(app.get('port'), () => {
   console.log('Server listening on port ',app.get('port'));
});
server.on('error', onError);
server.on('listening', onListening);

// /**
//  * Create HTTPS server.
//  */ 
 
// var options = {
// //   key: fs.readFileSync(__dirname+'/private.key'),
// //   cert: fs.readFileSync(__dirname+'/certificate.pem')
//     key: process.env.HTTPS_PRIVATE_KEY,
//     cert: process.env.HTTPS_CERTIFICATE
// };

// var secureServer = https.createServer(options,app);

// /**
//  * Listen on provided port, on all network interfaces.
//  */

// secureServer.listen(app.get('secPort'), () => {
//    console.log('Server listening on port ',app.get('secPort'));
// });
// secureServer.on('error', onError);
// secureServer.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
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

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}