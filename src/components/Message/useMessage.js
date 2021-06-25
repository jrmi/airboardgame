import React from "react";
import { nanoid } from "nanoid";
import { atom, useRecoilState, useRecoilCallback } from "recoil";

import dayjs from "dayjs";

import { useUsers } from "../users";
import useC2C from "../../hooks/useC2C";

export const MessagesAtom = atom({
  key: "messages",
  default: [],
});

const generateMsg = ({ user: { name, uid, color }, content }) => {
  const newMessage = {
    type: "message",
    user: { name, uid, color },
    content,
    uid: nanoid(),
    timestamp: dayjs().toISOString(),
  };
  return newMessage;
};

export const parseMessage = (message) => {
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
  const [messages, setMessagesState] = useRecoilState(MessagesAtom);
  const { c2c, isMaster } = useC2C("board");
  const { currentUser } = useUsers();

  const getMessage = useRecoilCallback(
    ({ snapshot }) => async () => {
      const currentMessages = await snapshot.getPromise(MessagesAtom);
      return currentMessages;
    },
    []
  );

  const setMessages = React.useCallback(
    (newMessages) => {
      setMessagesState(newMessages.map((m) => parseMessage(m)));
    },
    [setMessagesState]
  );

  const initEvents = React.useCallback(
    (unsub) => {
      unsub.push(
        c2c.subscribe("newMessage", (newMessage) => {
          setMessagesState((prevMessages) => [
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
          setMessages(messageHistory);
        });
      }
    },
    [c2c, getMessage, isMaster, onMessage, setMessages, setMessagesState]
  );

  React.useEffect(() => {
    const unsub = [];

    initEvents(unsub);

    return () => {
      unsub.forEach((u) => u());
    };
  }, [initEvents]);

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
