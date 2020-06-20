var redis = require('./redis');

module.exports = {
  init: function(io) {
    io.sockets.on('connection', function(socket) {
      console.log(`New connection id: ${socket.id}`)
      var existingSocket = activeSockets.find(function (existingSocket) { return existingSocket === socket.id; })
      if (!existingSocket) {
          activeSockets.push(socket.id);
          socket.emit("update-user-list", {
              users: activeSockets.filter(function (existingSocket) { return existingSocket !== socket.id; })
          });
          socket.broadcast.emit("update-user-list", {
              users: [socket.id]
          });
      }

      socket.on("call-user", function (data) {
        console.log(data)
        console.log("calling.................")
          socket.to(data.to).emit("call-made", {
              from: socket.id
          });
      });

      socket.on("make-answer", function (data) {
          socket.to(data.to).emit("answer-made", {
              from: socket.id,
              room: data.room
          });
      });
      socket.on('message', function(message) {
        console.log('Client said: ', message);
        socket.broadcast.emit('message', message);
      });

      socket.on('create or join', function(room) {
        console.log('Received request to create or join room ' + room);

        console.log('Room ' + room + ' now has ' + numClients + ' client(s)');
        var roomMembers = redis.getRoomMembers(room);
        if(roomMembers != null) {
          redis.insertInRoom(room, socket.id);
          console.log('Client ID ' + socket.id + ' joined room ' + room);
          io.sockets.in(room).emit('join', room);
          socket.join(room);
          socket.emit('joined', room, socket.id);
          io.sockets.in(room).emit('ready');
        } else {
          redis.insertInRoom(room, socket.id);
          socket.join(room);
          console.log('Client ID ' + socket.id + ' created room ' + room);
          socket.emit('created', room, socket.id);
        }
      });

      socket.on('ipaddr', function() {
        var ifaces = os.networkInterfaces();
        for (var dev in ifaces) {
          ifaces[dev].forEach(function(details) {
            if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
              socket.emit('ipaddr', details.address);
            }
          });
        }
      });

      socket.on('bye', function() {
        console.log('received bye');
      });

      socket.on('disconnect', function() {
         console.log('Got disconnect!');
      });
    });
  }
}
