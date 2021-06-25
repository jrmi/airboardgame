import React from "react";

import { C2CProvider } from "../components/hooks/useC2C";

import SessionView from "./SessionView";
import { SubscribeUserEvents } from "../components/users";

const RoomWrapper = (props) => {
  return (
    <>
      <SessionView {...props} />
      <SubscribeUserEvents />
    </>
  );
};

const ConnectedRoomWrapper = (props) => (
  <C2CProvider room={`room__${props.sessionId}`} channel="room">
    <RoomWrapper {...props} />
  </C2CProvider>
);

export default ConnectedRoomWrapper;
