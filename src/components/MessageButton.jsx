import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import useMessage from "../hooks/useMessage";

import Touch from "../ui/Touch";
import SidePanel from "../ui/SidePanel";
import { useUsers } from "./users";

const StyledMessage = styled.div`
  font-size: 1.2em;
  & .line {
    display: flex;
    flex-direction: row;
    padding: 0rem 0.2rem;
    padding: 0.5rem 0;
    & p {
      margin: 0;
    }
  }
  & .name {
    padding-left: 0.5em;
    font-size: 1.3em;
    ${({ color }) => `color: ${color};`}
    text-shadow: 0px 0px 1px var(--color-grey);
  }
  & .left-block {
    padding: 0 1rem;
    opacity: 0;
  }
  &:hover {
    & .line {
      background-color: var(--color-midGrey);
    }
    & .left-block {
      opacity: 0.8;
    }
  }
`;

const Message = ({
  first,
  user: { name, color = "#dddddd" },
  timestamp,
  content,
}) => {
  return (
    <StyledMessage color={color}>
      {first && <div className="name">{name}</div>}
      <div className="line">
        <div className="left-block">
          <span>{timestamp.format("HH:mm")}</span>
        </div>
        <p>{content}</p>
      </div>
    </StyledMessage>
  );
};

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

const StyleComposer = styled.div`
  padding: 0.5em;
  flex: 0;
  & form {
    display: flex;
  }
  overflow: none;
`;

const Composer = ({ sendMessage }) => {
  const { t } = useTranslation();
  const [text, setText] = React.useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    if (text) {
      setText("");
      sendMessage(text);
    }
  };
  const onChange = (e) => {
    setText(e.target.value);
  };
  return (
    <StyleComposer>
      <form onSubmit={(e) => onSubmit(e)}>
        <input
          onChange={(e) => onChange(e)}
          value={text}
          type="text"
          placeholder={t("Enter your message and press ENTER")}
          autoFocus={true}
        />
        <button>{t("Send")}</button>
      </form>
    </StyleComposer>
  );
};

const StyledChat = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const MessageButton = () => {
  const { t } = useTranslation();
  const { messages, sendMessage } = useMessage();
  const [showPanel, setShowPanel] = React.useState(false);

  return (
    <>
      <Touch
        onClick={() => setShowPanel((prev) => !prev)}
        alt={t("Chat")}
        title={t("Chat")}
        label={t("Chat")}
        icon={"message"}
        style={{ flex: 1 }}
        active={showPanel}
      />
      <SidePanel
        open={showPanel}
        onClose={() => {
          setShowPanel(false);
        }}
        position="left"
        noMargin
        title={t("Chat")}
        width="25%"
      >
        <StyledChat>
          <MessageList messages={messages} />
          <Composer sendMessage={sendMessage} />
        </StyledChat>
      </SidePanel>
    </>
  );
};

export default MessageButton;
