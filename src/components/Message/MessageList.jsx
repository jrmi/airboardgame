import React from "react";
import styled from "styled-components";

import { useUsers } from "../users";
import Message from "./Message";

const computeMessageGroup = (messages, userMap, maxTimeDiff = 30000) => {
  if (!messages || messages.length === 0) return [];

  const messageGroups = [];
  let previousUser = messages[0].user.uid;
  let previousUserName = messages[0].user.name;
  let previousTime = messages[0].timestamp;
  let currentGroup = [];

  messages.forEach((message, index) => {
    if (
      message.user.uid !== previousUser ||
      message.user.name !== previousUserName ||
      message.timestamp.diff(previousTime) > maxTimeDiff
    ) {
      previousUser = message.user.uid;
      previousUserName = message.user.name;
      messageGroups.push({
        id: currentGroup[0].uid,
        group: currentGroup,
      });
      currentGroup = [];
    }
    previousTime = message.timestamp;

    // Get user from current session
    const messageWithUser = { ...message };
    if (message.user.uid in userMap) {
      messageWithUser.user = userMap[message.user.uid];
    }

    currentGroup.push(messageWithUser);
    if (index === messages.length - 1) {
      messageGroups.push({
        id: currentGroup[0].uid,
        group: currentGroup,
      });
    }
  });
  return messageGroups;
};

const StyledMessageList = styled.div`
  height: 100%;
  overflow: auto;
`;

const MessageList = ({ messages }) => {
  const messageList = React.useRef(null);
  const { users } = useUsers();

  const userMap = React.useMemo(
    () =>
      users.reduce((acc, user) => {
        acc[user.uid] = user;
        return acc;
      }, {}),
    [users]
  );

  const messageGroups = React.useMemo(
    () => computeMessageGroup(messages, userMap),
    [messages, userMap]
  );

  React.useEffect(() => {
    messageList.current.scrollTop = messageList.current.scrollHeight;
  });

  return (
    <StyledMessageList ref={messageList}>
      {messageGroups.map(({ id: groupUid, group }) => {
        return (
          <div key={groupUid}>
            {group.map(({ uid: msgUid, user, timestamp, content }, index) => (
              <Message
                first={index === 0}
                user={user}
                timestamp={timestamp}
                content={content}
                key={msgUid}
              />
            ))}
          </div>
        );
      })}
    </StyledMessageList>
  );
};

export default MessageList;
