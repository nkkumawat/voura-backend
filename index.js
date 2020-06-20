'use strict';
var socketIO = require('socket.io');
const express = require('express');
const app = express()
var socket = require('./socket');
const port = 4002
app.get('/', (req, res) => {
  res.send('Voura is running');
})
var server = app.listen(port, () => {
  console.log(`Voura Backend is listening at http://localhost:${port}`)
})
socket.init(socketIO.listen(server));

// io.sockets.on('connection', function(socket) {
//   console.log("new connection-------------------")
//
//   var existingSocket = activeSockets.find(function (existingSocket) { return existingSocket === socket.id; })
//   if (!existingSocket) {
//       activeSockets.push(socket.id);
//       socket.emit("update-user-list", {
//           users: activeSockets.filter(function (existingSocket) { return existingSocket !== socket.id; })
//       });
//       socket.broadcast.emit("update-user-list", {
//           users: [socket.id]
//       });
//   }
//
//   socket.on("call-user", function (data) {
//     console.log(data)
//     console.log("calling.................")
//       socket.to(data.to).emit("call-made", {
//           from: socket.id
//       });
//   });
//
//   socket.on("make-answer", function (data) {
//       socket.to(data.to).emit("answer-made", {
//           from: socket.id,
//           room: data.room
//       });
//   });
//   socket.on('message', function(message) {
//     console.log('Client said: ', message);
//     socket.broadcast.emit('message', message);
//   });
//
//   socket.on('create or join', function(room) {
//     console.log('Received request to create or join room ' + room);
//
//     // var numClients = io.sockets.sockets.length;
//     numClients ++ ;
//     console.log('Room ' + room + ' now has ' + numClients + ' client(s)');
//
//     if (numClients === 1) {
//       socket.join(room);
//       console.log('Client ID ' + socket.id + ' created room ' + room);
//       socket.emit('created', room, socket.id);
//
//     } else if (numClients === 2) {
//       console.log('Client ID ' + socket.id + ' joined room ' + room);
//       io.sockets.in(room).emit('join', room);
//       socket.join(room);
//       socket.emit('joined', room, socket.id);
//       io.sockets.in(room).emit('ready');
//     } else { // max 5 clients
//       socket.emit('full', room);
//     }
//   });
//
//   socket.on('ipaddr', function() {
//     var ifaces = os.networkInterfaces();
//     for (var dev in ifaces) {
//       ifaces[dev].forEach(function(details) {
//         if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
//           socket.emit('ipaddr', details.address);
//         }
//       });
//     }
//   });
//
//   socket.on('bye', function() {
//     console.log('received bye');
//   });
// });
