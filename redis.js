const redis = require("ioredis");
const client = new redis();

module.exports = {
  saveNewConnection: async function(socketId) {
    client.sadd('connections', socketId);
  },
  getAllConnections: async function() {
    var data = null;
    await client.smembers('connections',(err, res) => {
      data = res;
    });
    return data;
  },
  removeConnection: async function(socketId) {
    await client.srem('connections', socketId);
    await client.smembers(socketId, (err, res) => {
      console.log(res);
      res.forEach((room) => {
        console.log(room)
        client.del(room);
      });
    })
    await client.del(socketId);
  },
  insertInRoom: async function(roomName, socketId) {
    await client.sadd(roomName, socketId);
    await client.sadd(socketId, roomName);
  },
  getRoomMembers: async function(roomName) {
    var data = null;
    await client.smembers(roomName, (err, res) => {
      console.log(err)
      console.log(res)
      data = res;
    });
    console.log("d", data)
    return data;
  },
}
