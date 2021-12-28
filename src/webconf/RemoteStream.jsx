import React from "react";

import Stream from "./Stream";

const RemoteStream = ({
  stream,
  subscribe = true,
  audio = true,
  video = true,
}) => {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (!stream) {
      return;
    }
    if (subscribe) {
      stream.subscribe();
    } else {
      stream.unsubscribe();
    }
  }, [subscribe, stream]);

  React.useEffect(() => {
    if (!stream) {
      return;
    }
    stream.enableVideo(video);
  }, [stream, video]);

  React.useEffect(() => {
    if (!stream) {
      return;
    }
    stream.enableAudio(audio);
  }, [stream, audio]);

  React.useEffect(() => {
    // React on published change
    setShow(stream.subscribed);
  }, [stream.subscribed]);

  if (!stream || !show) {
    return null;
  }

  return <Stream stream={stream} />;
};

export default RemoteStream;
