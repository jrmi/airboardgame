import openSocket from 'socket.io-client';
import { nanoid } from 'nanoid';

const socket = openSocket('http://localhost:8000');

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const roomName = urlParams.get('room');
console.log(roomName);

let userList = [];

export const init = ({ onCursorMove }) => {
  const user = {
    name: 'userx',
    uid: nanoid(),
  };

  // When other move their mouse
  socket.on('mouseMoved', (params) => {
    onCursorMove(params);
  });

  socket.on('userListUpdate', () => {});

  // Finally join the room
  socket.emit('join', { room: roomName, user });
};

export const emitMouseMove = (newPos) => {
  socket.emit('mouseMove', newPos);
};

export default socket;
