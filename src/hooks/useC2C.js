import React, { useContext } from "react";
import { useSocket } from "@scripters/use-socket.io";
import { join } from "client2client.io";
import { useTranslation } from "react-i18next";

import Waiter from "../components/Waiter";

export const C2CContext = React.createContext([null, false]);

export const C2CProvider = ({ room, ...props }) => {
  const { t } = useTranslation();
  const socket = useSocket();
  const [joined, setJoined] = React.useState(false);
  const [isMaster, setIsMaster] = React.useState(false);
  const [c2c, setC2c] = React.useState(null);
  const roomRef = React.useRef(null);

  React.useEffect(() => {
    const connect = () => {
      // Do nothing for now. Need c2c handling reconnection.
      // setJoined(true);
    };
    const disconnect = () => {
      console.log("disconnected");
      setJoined(false);
    };
    socket.on("connect", connect);
    socket.on("disconnect", disconnect);
    return () => {
      socket.off("disconnect", disconnect);
      socket.off("connect", connect);
    };
  }, [socket]);

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

  if (!joined || !c2c) {
    return <Waiter message={t("Waiting for connection…")} />;
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
