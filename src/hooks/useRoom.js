import React from 'react';
import { useSocket } from '@scripters/use-socket.io';
// import { nanoid } from 'nanoid';
//import debounce from 'lodash.debounce';
import { join } from 'client2client.io';

const useRoom = ({ room, user, setUser, onMouseMove = () => {} }) => {
  const socket = useSocket();
  //const [users, setUsers] = React.useState([]);
  const [user, setUser] = React.useState([]);
  const [joined, setJoined] = React.useState(false);
  const [isMaster, setMaster] = React.useState(false);
  const roomRef = React.useRef(null);
  const usersRef = React.useRef([]);

  React.useEffect(() => {
    if (!socket) {
      return;
    }
    join(socket, room).then((newRoom) => {
      console.log('Connected…');

      roomRef.current = newRoom;

      roomRef.current.call('getUserList').then(
        (userList) => {
          console.log('get user list');
          usersRef.current = userList;
          setJoined(true);
        },
        () => {
          console.log('I am the master');
          // I'm the master
          setMaster(true);

          setUser((prevUser) => ({ ...prevUser, id: roomRef.current.userId }));
          /*usersRef.current = [
            {
              ...user,
            },
          ];*/
          newRoom.register('getUserList', () => {
            return usersRef.current;
          });
          newRoom.subscribe('userLeave', () => {});
          setJoined(true);
        }
      );

      const unsubscribeUpdateUsers = newRoom.subscribe(
        'updateUserList',
        (userList) => {
          console.log('upuser', userList);
          usersRef.current = userList;
        }
      );

      const unsubscribeMouseMouve = newRoom.subscribe('mouseMove', (data) => {
        onMouseMove(data);
      });

      return () => {
        unsubscribeMouseMouve();
        unsubscribeUpdateUsers();
      };
    });
  }, [room, socket]);

  React.useEffect(() => {
    if (!joined) {
      return;
    }
    console.log('should up users');
    if (usersRef.current.find((u) => u.id === user.id)) {
      const newUsers = usersRef.current.map((u) =>
        u.id === user.id ? user : u
      );
      roomRef.current.publish('updateUserList', newUsers, true);
    } else {
      const newUsers = [...usersRef.current, user];
      roomRef.current.publish('updateUserList', newUsers, true);
    }
  }, [user, joined]);

  return [usersRef, joined];
};

export default useRoom;
