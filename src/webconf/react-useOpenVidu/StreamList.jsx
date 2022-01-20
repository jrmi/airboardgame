import React from "react";

import useOpenVidu from "./useOpenVidu";

import LocalStream from "./LocalStream";
import RemoteStream from "./RemoteStream";

const StreamList = ({
  currentUser,
  users,
  audioOnly = true,
  enableLocalVideo = false,
  enableLocalAudio = true,
  setLocalVideo = () => {},
  setLocalAudio = () => {},
}) => {
  const { remoteStreams = [], localStream } = useOpenVidu();

  const streamMap = React.useMemo(
    () =>
      remoteStreams.reduce((acc, stream) => {
        acc[stream.data.uid] = stream;
        return acc;
      }, {}),
    [remoteStreams]
  );

  return (
    <div className="stream-list">
      {localStream && (
        <div className="local-stream">
          <LocalStream
            stream={localStream}
            video={enableLocalVideo && !audioOnly}
            audio={enableLocalAudio}
            user={currentUser}
          />
          <div className="actions">
            {!audioOnly && (
              <button
                onClick={() => setLocalVideo(!enableLocalVideo)}
                className={enableLocalVideo ? "active" : ""}
              >
                <img
                  src={
                    enableLocalVideo
                      ? "https://icongr.am/feather/camera.svg?size=16&color=f9fbfa"
                      : "https://icongr.am/feather/camera-off.svg?size=16&color=f9fbfa"
                  }
                />
              </button>
            )}
            <button
              onClick={() => setLocalAudio(!enableLocalAudio)}
              className={enableLocalAudio ? "active" : ""}
            >
              <img
                src={
                  enableLocalAudio
                    ? "https://icongr.am/feather/mic.svg?size=16&color=f9fbfa"
                    : "https://icongr.am/feather/mic-off.svg?size=16&color=f9fbfa"
                }
              />
            </button>
          </div>
        </div>
      )}
      {users.map(
        (user) =>
          streamMap[user.uid] && (
            <div key={user.uid} className="remote-stream">
              <RemoteStream stream={streamMap[user.uid]} user={user} />
            </div>
          )
      )}
    </div>
  );
};

export default StreamList;
