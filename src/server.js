var express = require('express');
var cors = require('cors');
const path = require('path');

var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var handleC2C = require('client2client.io').handleC2C;

app.use(cors());

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
