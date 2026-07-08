const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// Every finished line segment gets stored here so a new visitor
// can redraw everything that happened before they connected.
let history = [];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Catch this new user up on everything drawn so far.
  socket.emit('history', history);

  socket.on('draw', (segment) => {
    history.push(segment);
    socket.broadcast.emit('draw', segment); // send to everyone else
  });

  socket.on('clear', () => {
    history = [];
    socket.broadcast.emit('clear');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
