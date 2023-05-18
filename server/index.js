// server.js
const express = require('express');
const path = require('path');
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(path.join(__dirname, '../client')));


io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('cursorEvent', (data) => {
    // Broadcast the cursor event to all connected clients except the sender
    socket.broadcast.emit('cursorEvent', { ...data, userID: socket.id });
  });

  socket.on('disconnect', () => {
    console.log('a user disconnected');
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
