import React from "react";
import styled from "styled-components";

import useOpenVidu from "./useOpenVidu";
import useToggle from "../../hooks/useToggle";

import useUsers from "../../components/users/useUsers";

import LocalStream from "./LocalStream";
import RemoteStream from "./RemoteStream";

const StyledWebConference = styled.div`
  position: fixed;
  top: 5em;
  right: 1em;
  bottom: 5.5em;
  z-index: 1;
  width: 150px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.5em;
  & video {
    border-radius: 5px;
  }
  & .local-stream {
    position: relative;
    & .actions {
      position: absolute;
      bottom: 2px;
      right: 0;
      left: 0;
      display: flex;
      justify-content: center;
    }

    & button {
      padding: 5px;
      margin: 5px;
      border-radius: 50%;
      opacity: 0.5;
      width: 30px;
      height: 30px;
    }
    & button.active {
      background-color: var(--color-primary);
    }
    &:hover button {
      opacity: 1;
    }
  }

  & .remote-stream {
    position: relative;
    margin-bottom: 0.5em;
    & .name {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 2px 5px;
      background-color: #95959540;
      text-align: center;
      border-radius: 0 0 5px 5px;
    }
  }
`;

const WebConferenceContent = () => {
  const { remoteStreams = [], localStream } = useOpenVidu();
  const [showLocalVideo, toggleVideo] = useToggle(true);
  const [showLocalAudio, toggleAudio] = useToggle(true);

  const { localUsers: users } = useUsers();

  const streamMap = React.useMemo(
    () =>
      remoteStreams.reduce((acc, stream) => {
        acc[stream.data.uid] = stream;
        return acc;
      }, {}),
    [remoteStreams]
  );

  return (
    <StyledWebConference>
      {localStream && (
        <div className="local-stream">
          <LocalStream
            stream={localStream}
            video={showLocalVideo}
            audio={showLocalAudio}
          />
          <div className="actions">
            <button
              onClick={toggleVideo}
              className={showLocalVideo ? "active" : ""}
            >
              <img
                src={"https://icongr.am/entypo/camera.svg?size=16&color=f9fbfa"}
              />
            </button>
            <button
              onClick={toggleAudio}
              className={showLocalAudio ? "active" : ""}
            >
              <img
                src={"https://icongr.am/entypo/mic.svg?size=16&color=f9fbfa"}
              />
            </button>
          </div>
        </div>
      )}
      {users.map(
        ({ name, uid, color }) =>
          streamMap[uid] && (
            <div key={uid} className="remote-stream">
              <RemoteStream stream={streamMap[uid]} />
              <span className="name" style={{ backgroundColor: color }}>
                {name}
              </span>
            </div>
          )
      )}
    </StyledWebConference>
  );
};

export default WebConferenceContent;
