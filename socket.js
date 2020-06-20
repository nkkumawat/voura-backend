var redis = require('./redis');

module.exports = {
  init: function(io) {
    activeSockets = [];
    io.sockets.on('connection', async function(socket) {
      console.log(`New connection, id: ${socket.id}`);
      await redis.saveNewConnection(socket.id);
      var activeConnections = await redis.getAllConnections();
      console.log(activeConnections)
      if(activeConnections != null && activeConnections.length != 0) {
        var notMe = activeConnections.filter(function (existingSocket) { return existingSocket !== socket.id; });
        console.log(notMe);
        setTimeout(() => {
        socket.emit("update-user-list", {
            users: activeConnections.filter(function (existingSocket) { return existingSocket !== socket.id; })
        });
      }, 2000);
        socket.broadcast.emit("update-user-list", {
            users: activeConnections
        });
      } else {
        await redis.saveNewConnection(socket.id);
      }
      socket.on("call-user", function (data) {
        console.log(`making call to ${data.to} from ${socket.id}` )
          socket.to(data.to).emit("call-made", {
              from: socket.id
          });
      });

      socket.on("make-answer", function (data) {
          console.log(`making answer to ${data.to} from ${socket.id} in room ${data.room}` )
          socket.to(data.to).emit("answer-made", {
              from: socket.id,
              room: data.room
          });
      });
      socket.on('message', function(message) {
        console.log('Client said: ', message);
        socket.broadcast.emit('message', message);
      });

      socket.on('create_or_join', async function(room) {
        var roomMembers = await redis.getRoomMembers(room);
        console.log('Room ' + room + ' now has ' + roomMembers);
        if(roomMembers && roomMembers.length != 0) {
          await redis.insertInRoom(room, socket.id);
          console.log('Client ID ' + socket.id + ' joined room ' + room);
          io.sockets.in(room).emit('join', room);
          socket.join(room);
          socket.emit('joined', room, socket.id);
          io.sockets.in(room).emit('ready');
        } else {
          await redis.insertInRoom(room, socket.id);
          socket.join(room);
          console.log('Client ID ' + socket.id + ' created room ' + room);
          socket.emit('created', room, socket.id);
        }
      });

      socket.on('bye', function() {
        console.log('received bye');
      });

      socket.on('disconnect', async function() {
         console.log('Got disconnect!' + socket.id);
         redis.removeConnection(socket.id);
      });
    });
  }
}
