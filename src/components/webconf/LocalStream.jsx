import React from "react";

import Stream from "./Stream";

const LocalStream = ({
  stream,
  publish = true,
  audio = true,
  video = true,
}) => {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (!stream) {
      return;
    }
    if (publish) {
      stream.publish();
    } else {
      stream.unpublish();
    }
  }, [publish, stream]);

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
    setShow(stream.published && Boolean(stream.publisher));
  }, [stream.published, stream.publisher]);

  if (!stream || !show) {
    return null;
  }

  return <Stream stream={stream} />;
};

export default LocalStream;