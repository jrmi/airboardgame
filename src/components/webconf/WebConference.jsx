import React from "react";
import { OpenViduProvider } from "./useOpenVidu";

import useUsers from "../../components/users/useUsers";
import StreamList from "./StreamList";

import { getConfToken } from "../../utils/api";

const WebConference = ({ room }) => {
  const { currentUser } = useUsers();

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
      <StreamList />
    </OpenViduProvider>
  );
};

export default WebConference;
