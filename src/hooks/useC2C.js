import React, { useContext } from 'react';
import { useSocket } from '@scripters/use-socket.io';
import { join } from 'client2client.io';

export const C2CContext = React.createContext([null, false]);

export const C2CProvider = ({ room, ...props }) => {
  const socket = useSocket();
  const [joined, setJoined] = React.useState(false);
  const [isMaster, setIsMaster] = React.useState(false);
  const [c2c, setC2c] = React.useState(null);
  const roomRef = React.useRef(null);

  React.useEffect(() => {
    if (!socket) {
      return;
    }
    join(socket, room).then((newRoom) => {
      console.log('Connected…');
      const unsub = [];
      roomRef.current = newRoom;

      setC2c(newRoom);

      newRoom.call('getMaster').then(
        (masterId) => {
          console.log(`${masterId} is the master`);
          setIsMaster(false);
          setJoined(true);
        },
        (err) => {
          console.log('I am the master');
          setIsMaster(true);
          unsub.push(
            newRoom.register('getMaster', () => {
              return newRoom.userId;
            })
          );
          setJoined(true);
        }
      );

      return () => {
        unsub.forEach((u) => u());
        socket.disconnect();
      };
    });
  }, [room, socket]);

  if (!joined) {
    return null;
  }

  return (
    <C2CContext.Provider value={[c2c, joined, isMaster]}>
      {props.children}
    </C2CContext.Provider>
  );
};

export const useC2C = () => {
  const [c2c, joined, isMaster] = useContext(C2CContext);
  return [c2c, joined, isMaster];
};

export default { C2CContext, C2CProvider, useC2C };
