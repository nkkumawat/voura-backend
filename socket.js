var redis = require('./redis');

module.exports = {
  init: function(io) {
    activeSockets = [];
    io.sockets.on('connection', async function(socket) {
      console.log(`New connection, id: ${socket.id}`);
      var activeConnections = await redis.getAllConnections();
      socket.on("get-active-users", async function (data) {
        await redis.saveNewConnection(socket.id, data.username);
        if(activeConnections != null && activeConnections.length != 0) {
          var notMe = [];
          activeConnections.forEach((item, i) => {
              item = JSON.parse(item)
              if(item.socketId != socket.id){
                notMe.push(item)
              }
          });
          socket.emit("add-user-list", {
              users: notMe
          });
        }
        socket.broadcast.emit("add-user-list", {
            users: [{socketId: socket.id, username: data.username}]
        });
      });

      socket.on("call-user", function (data) {
        console.log(`making call to ${data.to} from ${socket.id}` )
          socket.to(data.to).emit("call-made", {
              from: socket.id,
              room: data.room
          });
      });

      socket.on("make-answer", function (data) {
          console.log(`making answer to ${data.to} from ${socket.id} in room ${data.room}` )
          socket.to(data.to).emit("answer-made", {
              from: socket.id,
              room: data.room
          });
      });

      socket.on('connection-events', function(message) {
        console.log('Client said: ', message);
        socket.broadcast.emit('connection-events', message);
      });

      socket.on('create-or-join', async function(room) {
        var roomMembers = await redis.getRoomMembers(room);
        console.log('Room ' + room + ' now has ' + roomMembers);
        if(roomMembers && roomMembers.length != 0) {
          await redis.insertInRoom(room, socket.id);
          console.log('Client ID ' + socket.id + ' joined room ' + room);
          io.sockets.in(room).emit('peer-connect', room);
          socket.join(room);
          socket.emit('peer-connected', room, socket.id);
          io.sockets.in(room).emit('ready');
        } else {
          await redis.insertInRoom(room, socket.id);
          socket.join(room);
          console.log('Client ID ' + socket.id + ' created room ' + room);
          socket.emit('room-created', room, socket.id);
        }
      });

      socket.on('close-call', async function(data) {
        roomName = await redis.getSocketRoom(socket.id);
        socket.leave(roomName);
        socket.to(data).emit("call-closed", {
            from: socket.id
        });
        console.log('received bye');
      });

      socket.on('disconnect', async function() {
         console.log('Got disconnect!' + socket.id);
         socket.broadcast.emit("remove-user-list", {
             users: [socket.id]
         });
         redis.removeConnection(socket.id);
      });
    });
  }
}
