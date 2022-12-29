import React from "react";
import { OpenVidu } from "openvidu-browser";
import { nanoid } from "nanoid";

export const OpenViduContext = React.createContext({});

class Stream {
  constructor({ stream, data, session }) {
    this.stream = stream;
    this.data = data;
    this._session = session;
    this.subscribed = false;
    this.subscriber = null;
    this.audio = true;
    this.video = true;
    this.uid = nanoid();
    this.toggleVideo = this.toggleVideo.bind(this);
    this.toggleAudio = this.toggleAudio.bind(this);
    this.toggleSubscribe = this.toggleSubscribe.bind(this);
  }
  subscribe() {
    if (this.subscribed) {
      return;
    }
    if (!this.subscriber) {
      this.subscriber = this._session.subscribe(this.stream);
    } else {
      this._session.subscribe(this.subscriber);
    }
    this.subscribed = true;
  }
  unsubscribe() {
    if (!this.subscribed) {
      return;
    }
    // We already had subscribed
    this.subscribed = false;
    this._session.unsubscribe(this.subscriber);
  }
  toggleSubscribe() {
    if (this.subscribed) {
      this.unsubscribe();
    } else {
      this.subscribe();
    }
  }
  enableVideo(value = true) {
    if (this.video === value) {
      return;
    }
    this._session.subscribeToVideo(value);
    this.video = value;
  }
  toggleVideo() {
    this.subscriber.publishVideo(!this.video);
    this.video = !this.video;
  }
  enableAudio(value = true) {
    if (this.audio === value) {
      return;
    }
    this._session.subscribeToAudio(value);
    this.audio = value;
  }
  toggleAudio() {
    this.subscriber.publishAudio(!this.audio);
    this.audio = !this.audio;
  }
  addVideoElement(elt) {
    if (!this.subscriber) {
      return;
    }
    this.subscriber.addVideoElement(elt);
  }
}

class LocalStream {
  constructor({ session, OV }) {
    this._session = session;
    this.published = false;
    this.publisher = null;
    this.audio = true;
    this.video = true;
    this.uid = nanoid();
    this._OV = OV;
    this.toggleVideo = this.toggleVideo.bind(this);
    this.toggleAudio = this.toggleAudio.bind(this);
    this.togglePublish = this.togglePublish.bind(this);
  }
  publish(config = {}, forceNew = false) {
    if (this.published) {
      return;
    }
    if (!this.publisher || forceNew) {
      this.publisher = this._OV.initPublisher(undefined, {
        audioSource: undefined, // The source of audio. If undefined default microphone
        videoSource: undefined, // The source of video. If undefined default webcam
        publishAudio: true, // Whether you want to start publishing with your audio unmuted or not
        publishVideo: true, // Whether you want to start publishing with your video enabled or not
        resolution: "320x240", // The resolution of your video
        frameRate: 10, // The frame rate of your video
        mirror: false, // Whether to mirror your local video or not
        ...config,
      });
    }
    this._session.publish(this.publisher);
    this.published = true;
  }
  unpublish() {
    if (!this.published) {
      return;
    }
    // We already had subscribed
    this.published = false;
    this._session.unpublish(this.publisher);
  }
  togglePublish() {
    if (this.published) {
      this.unpublish();
    } else {
      this.publish();
    }
  }
  enableVideo(value = true) {
    if (this.video === value) {
      return;
    }
    try {
      this.publisher.publishVideo(value);
    } catch (e) {
      setTimeout(() => {
        try {
          this.publisher.publishVideo(value);
        } catch (e) {
          console.log("Error while trying to change video publishing:", e);
        }
      }, 2000);
    }
    this.video = value;
  }
  toggleVideo() {
    this.publisher.publishVideo(!this.video);
    this.video = !this.video;
  }
  enableAudio(value = true) {
    if (this.audio === value) {
      return;
    }
    try {
      this.publisher.publishAudio(value);
    } catch (e) {
      setTimeout(() => {
        try {
          this.publisher.publishVideo(value);
        } catch (e) {
          console.log("Error while trying change audio publishing:", e);
        }
      }, 2000);
    }
    this.audio = value;
  }
  toggleAudio() {
    this.publisher.publishAudio(!this.audio);
    this.audio = !this.audio;
  }
  addVideoElement(elt) {
    if (!this.publisher) {
      return;
    }
    this.publisher.addVideoElement(elt);
  }
}

const defaultParseData = (d) => d;
const defaultSetData = () => nanoid();

export const OpenViduProvider = ({
  children,
  room,
  getToken,
  parseUserData = defaultParseData,
  getUserData = defaultSetData,
}) => {
  const OVRef = React.useRef(new OpenVidu());
  const instanceRef = React.useRef({});
  const [connected, setConnected] = React.useState(false);
  const [remoteStreams, setRemoteStreams] = React.useState([]);
  const [localStream, setLocalStream] = React.useState(null);

  const joinSession = React.useCallback(
    async ({ room, parseUserData, getUserData }) => {
      console.log("Join conf session...");
      if (!OVRef.current) {
        OVRef.current = new OpenVidu();
      }
      OVRef.current.enableProdMode();
      const newSession = OVRef.current.initSession();

      // On every new Stream received...
      newSession.on("streamCreated", (event) => {
        // Subscribe to the Stream to receive it. Second parameter is undefined
        // so OpenVidu doesn't create an HTML video by its own
        const newStream = new Stream({
          data: parseUserData(event.stream.connection.data),
          stream: event.stream,
          session: newSession,
        });
        setRemoteStreams((prev) => [...prev, newStream]);
      });

      // On every Stream destroyed...
      newSession.on("streamDestroyed", (event) => {
        setRemoteStreams((prev) =>
          prev.filter(({ stream }) => stream !== event.stream)
        );
      });

      newSession.on("streamPropertyChanged", () => {
        // Just update the map to trigger the render
        setRemoteStreams((prev) => prev.slice());
      });

      const token = await getToken(room);

      const userData = getUserData();
      await newSession.connect(token, userData);

      setLocalStream(
        new LocalStream({ session: newSession, OV: OVRef.current })
      );

      setConnected(true);

      instanceRef.current.session = newSession;
    },
    [getToken]
  );

  const onLeave = React.useCallback(() => {
    const { session } = instanceRef.current;
    if (session) {
      session.disconnect();
      instanceRef.current = {};
      OVRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("beforeunload", onLeave);
    };
  }, [onLeave]);

  React.useEffect(() => {
    joinSession({ room, parseUserData, getUserData });
    return onLeave;
  }, [getUserData, joinSession, onLeave, parseUserData, room]);

  return (
    <OpenViduContext.Provider value={{ remoteStreams, localStream }}>
      {connected && children}
    </OpenViduContext.Provider>
  );
};

const useOpenVidu = () => {
  return React.useContext(OpenViduContext);
};

export default useOpenVidu;
