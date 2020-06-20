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
