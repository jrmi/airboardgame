import React from "react";
import { OpenViduProvider } from "./useOpenVidu";

import { useC2C } from "../../hooks/useC2C";

import useUsers from "../../components/users/useUsers";
import WebConferenceContent from "./WebConferenceContent";

//const OPENVIDU_SERVER_URL = "https://" + window.location.hostname + ":4443";
const OPENVIDU_SERVER_URL = "https://192.168.0.11:4443";
const OPENVIDU_SERVER_SECRET = "MY_SECRET";

const createSession = (sessionId) => {
  return new Promise((resolve, reject) => {
    fetch(`${OPENVIDU_SERVER_URL}/openvidu/api/sessions`, {
      method: "POST",
      body: JSON.stringify({ customSessionId: sessionId }),
      headers: {
        Authorization: "Basic " + btoa(`OPENVIDUAPP:${OPENVIDU_SERVER_SECRET}`),
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.status === 409) {
          resolve(sessionId);
        } else {
          response.json().then((data) => {
            resolve(data.id);
          });
        }
      })
      .catch((error) => {
        console.warn(
          "No connection to OpenVidu Server. This may be a certificate error at " +
            OPENVIDU_SERVER_URL
        );
        if (
          window.confirm(
            `No connection to OpenVidu Server. This may be a certificate error at
              ${OPENVIDU_SERVER_URL}
              
              Click OK to navigate and accept it.

              If no certificate warning is shown, then check that your OpenVidu Server is up and running at 
              ${OPENVIDU_SERVER_URL}`
          )
        ) {
          window.location.assign(`${OPENVIDU_SERVER_URL}/accept-certificate`);
        }
        reject(error);
      });
  });
};

const createToken = (sessionId) => {
  return fetch(
    `${OPENVIDU_SERVER_URL}/openvidu/api/sessions/${sessionId}/connection`,
    {
      method: "POST",
      body: JSON.stringify({}),
      headers: {
        Authorization: "Basic " + btoa(`OPENVIDUAPP:${OPENVIDU_SERVER_SECRET}`),
        "Content-Type": "application/json",
      },
    }
  )
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log("TOKEN", data);
      return data.token;
    });
};

const getToken = (mySessionId) => {
  return createSession(mySessionId).then((sessionId) => createToken(sessionId));
};

const WebConference = () => {
  const { room } = useC2C();
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
      getToken={getToken}
    >
      <WebConferenceContent />
    </OpenViduProvider>
  );
};

export default WebConference;
