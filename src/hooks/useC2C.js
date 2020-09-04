import React, { useContext } from "react";
import { useSocket } from "@scripters/use-socket.io";
import { join } from "client2client.io";
import { useTranslation } from "react-i18next";

import Waiter from "../ui/Waiter";

export const C2CContext = React.createContext([null, false]);

export const C2CProvider = ({ room, ...props }) => {
  const { t } = useTranslation();
  const socket = useSocket();
  const [joined, setJoined] = React.useState(false);
  const [isMaster, setIsMaster] = React.useState(false);
  const [c2c, setC2c] = React.useState(null);
  const roomRef = React.useRef(null);

  React.useEffect(() => {
    const disconnect = () => {
      console.log("Disconnected…");
      setJoined(false);
      setIsMaster(false);
    };

    socket.on("disconnect", disconnect);
    return () => {
      socket.off("disconnect", disconnect);
    };
  }, [socket]);

  React.useEffect(() => {
    if (!socket) {
      return;
    }
    if (!socket.connected) {
      socket.connect();
    }
    join({
      socket,
      room,
      onMaster: () => {
        console.log("Is now first player…");
        setIsMaster(true);
      },
      onJoined: (newRoom) => {
        console.log("Connected…");
        roomRef.current = newRoom;

        setC2c(newRoom);

        setJoined(true);

        return () => {
          socket.disconnect();
        };
      },
    });
    return () => {
      socket.disconnect();
    };
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
