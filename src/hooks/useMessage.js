import React from "react";
import { nanoid } from "nanoid";
import { atom, useRecoilState, useRecoilCallback } from "recoil";

import dayjs from "dayjs";

import { useUsers } from "../components/users";
import { useC2C } from "./useC2C";

export const MessagesAtom = atom({
  key: "messages",
  default: [],
});

const generateMsg = ({ user: { name, uid }, content }) => {
  const newMessage = {
    type: "message",
    user: { name, uid },
    content,
    uid: nanoid(),
    timestamp: dayjs().toISOString(),
  };
  return newMessage;
};

const parseMessage = (message) => {
  try {
    return {
      ...message,
      timestamp: dayjs(message.timestamp),
    };
  } catch (e) {
    console.warn("Discard message as it can't be decoded", e);
  }
  return null;
};

const noop = () => {};

const useMessage = (onMessage = noop) => {
  const [messages, setMessages] = useRecoilState(MessagesAtom);
  const { c2c, joined, isMaster } = useC2C();
  const { currentUser } = useUsers();

  const getMessage = useRecoilCallback(
    ({ snapshot }) => async () => {
      const currentMessages = await snapshot.getPromise(MessagesAtom);
      return currentMessages;
    },
    []
  );

  const initEvents = React.useCallback(
    (unsub) => {
      unsub.push(
        c2c.subscribe("newMessage", (newMessage) => {
          setMessages((prevMessages) => [
            ...prevMessages,
            parseMessage(newMessage),
          ]);
          onMessage(newMessage);
        })
      );
      if (isMaster) {
        c2c.register("getMessageHistory", getMessage).then((unregister) => {
          unsub.push(unregister);
        });
      } else {
        c2c.call("getMessageHistory").then((messageHistory) => {
          setMessages(messageHistory.map((m) => parseMessage(m)));
        });
      }
    },
    [c2c, getMessage, isMaster, onMessage, setMessages]
  );

  React.useEffect(() => {
    const unsub = [];

    if (joined) {
      initEvents(unsub);
    }

    return () => {
      unsub.forEach((u) => u());
    };
  }, [initEvents, joined]);

  const sendMessage = React.useCallback(
    (messageContent) => {
      const newMessage = generateMsg({
        user: currentUser,
        content: messageContent,
      });
      if (newMessage) c2c.publish("newMessage", newMessage, true);
    },
    [c2c, currentUser]
  );

  return { messages, setMessages, sendMessage };
};

export default useMessage;
