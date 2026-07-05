const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// One history array per room name, e.g. rooms['art-class'] = [segment, segment, ...]
const rooms = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  let currentRoom = null;

  socket.on('joinRoom', (roomName) => {
    currentRoom = roomName;
    socket.join(roomName);

    if (!rooms[roomName]) {
      rooms[roomName] = [];
    }

    // Catch this new user up on everything drawn so far in this room.
    socket.emit('history', rooms[roomName]);
  });

  socket.on('draw', (segment) => {
    if (!currentRoom) return;
    rooms[currentRoom].push(segment);
    socket.to(currentRoom).emit('draw', segment); // send to others in this room only
  });

  socket.on('clear', () => {
    if (!currentRoom) return;
    rooms[currentRoom] = [];
    socket.to(currentRoom).emit('clear');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
