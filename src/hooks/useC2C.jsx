import React, { useContext } from "react";
import { useSocket } from "@scripters/use-socket.io";
import { join } from "client2client.io";
import { useTranslation } from "react-i18next";

import Waiter from "../ui/Waiter";

const contextMap = {};

export const C2CProvider = ({ room, channel = "default", children }) => {
  const { t } = useTranslation();
  const socket = useSocket();
  const [joined, setJoined] = React.useState(false);
  const [isMaster, setIsMaster] = React.useState(false);
  const [c2c, setC2c] = React.useState(null);
  const roomRef = React.useRef(null);

  if (!contextMap[channel]) {
    contextMap[channel] = React.createContext({
      joined: false,
      isMaster: false,
    });
  }

  const Context = contextMap[channel];

  React.useEffect(() => {
    const disconnect = () => {
      console.log(`Disconnected from ${channel}…`);
      setJoined(false);
      setIsMaster(false);
    };

    socket.on("disconnect", disconnect);
    return () => {
      socket.off("disconnect", disconnect);
    };
  }, [channel, socket]);

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
        console.log(`Is now master on channel ${channel}…`);
        setIsMaster(true);
      },
      onJoined: (newRoom) => {
        console.log(`Connected on channel ${channel}…`);
        roomRef.current = newRoom;

        setC2c(newRoom);

        setJoined(true);
      },
    });
    return () => {
      roomRef.current.leave();
    };
  }, [channel, room, socket]);

  if (!joined || !c2c) {
    return <Waiter message={t("Waiting for connection…")} />;
  }

  return (
    <Context.Provider value={{ c2c, joined, isMaster, room }}>
      {children}
    </Context.Provider>
  );
};

export const useC2C = (channel = "default") => {
  const Context = contextMap[channel];
  return useContext(Context);
};

export default useC2C;
