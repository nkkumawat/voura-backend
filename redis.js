const redis = require("ioredis");
const client = new redis();

module.exports = {
  saveNewConnection: async function(socketId, username) {
    client.sadd('connections', socketId);
    client.hset('all-users', socketId, JSON.stringify({'username': username, 'socketId': socketId}));
  },
  getAllConnections: async function() {
    var data = [];
    await client.hgetall('all-users',(err, res) => {
      data = Object.values(res);
    });
    return data;
  },
  getSocketRoom: async function(socketId) {
    var data = null;
    await client.smembers(socketId,(err, res) => {
      data = res[0]
    });
    return data;
  },
  removeConnection: async function(socketId) {
    await client.srem('connections', socketId);
    await client.hdel('all-users', socketId);
    await client.smembers(socketId, (err, res) => {
      res.forEach((room) => {
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
      data = res;
    });
    return data;
  },
}
