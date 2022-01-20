import React from "react";

import UserStream from "./UserStream";

const LocalStream = ({
  stream,
  user,
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
      stream.publish({ publishAudio: audio, publishVideo: video });
    } else {
      stream.unpublish();
    }
    // No need to react on audio or video value change
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <UserStream
      stream={stream}
      self={true}
      name={user.name}
      color={user.color}
      audio={audio}
      video={video}
    />
  );
};

export default LocalStream;
