/*const io = require('socket.io')();
const uuid = require('uuid');

const rooms = {};

io.on('connection', (socket) => {
  socket.on('join', (roomName) => {
    if (rooms[roomName] === undefined) {
      rooms[roomName] = [];
    }
    const userId = uuid.v4();
    rooms[roomName].push(userId);
    console.log(`User ${userId} join ${roomName}`);

    socket.join(roomName);
    socket.emit('yourid', { user: userId });

    // Send new user to all user of this room
    socket.broadcast.to(roomName).emit('incoming', { user: userId });

    socket.on('mouseMove', (newPos) => {
      socket.broadcast
        .to(roomName)
        .emit('mouseMoved', { user: userId, newPos });
    });
    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
      rooms[roomName] = rooms[roomName].filter((id) => id === userId);
    });
  });
});

const port = 8000;
io.listen(port);
console.log('listening on port ', port);*/

var nanoid = require('nanoid').nanoid;
var express = require('express');
const path = require('path');
/*const Datastore = require('nedb');*/

var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var handleC2C = require('client2client.io').handleC2C;

const port = process.env.PORT || 4000;

app.use(express.static(path.join(__dirname, '../build')));

// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

http.listen(port, () => {
  console.log(`listening on *:${port}`);
});

io.on('connection', (socket) => {
  handleC2C(socket);
});
