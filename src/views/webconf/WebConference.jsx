import React from "react";

// import useUsers from "../../components/users/useUsers";
import { getConfToken } from "../../utils/api";

import { OpenViduProvider } from "./useOpenVidu";
import StreamList from "./StreamList";

const WebConference = ({ room, currentUser, users }) => {
  // const { currentUser } = useUsers();

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
