import React from "react";

import { getConfToken } from "../utils/api";

import { OpenViduProvider } from "./useOpenVidu";
import StreamList from "./StreamList";

const WebConference = ({ room, currentUser, users }) => {
  const getUserData = React.useCallback(
    () => JSON.stringify({ uid: currentUser.uid }),
    [currentUser.uid]
  );

  return (
    <OpenViduProvider
      room={room}
      parseUserData={JSON.parse}
      getUserData={getUserData}
      getToken={getConfToken}
    >
      <StreamList users={users} />
    </OpenViduProvider>
  );
};

export default WebConference;
