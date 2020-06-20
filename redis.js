const redis = require("ioredis");
const client = new redis();

module.exports = {
  saveNewConnection: function(socketId) {
    client.sadd('connections', socketId);
  },
  getAllConnections: function(socketId) {
    client.smembers('connections');
  },
  insertInRoom: async function(roomName, socketId) {
    await client.sadd(roomName, socketId);
  },
  getRoomMembers: async function(roomName) {
    await client.smembers(roomName, (err, res) => {
      return res;
    });
  },
}
