import React, { useContext } from "react";
import { useSocket } from "@scripters/use-socket.io";
import { join } from "client2client.io";

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
    join(socket, room, () => {
      console.log("isMaster");
      setIsMaster(true);
    }).then((newRoom) => {
      console.log("Connected…");
      roomRef.current = newRoom;

      setC2c(newRoom);

      setJoined(true);

      return () => {
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
