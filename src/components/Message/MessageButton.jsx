import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import useMessage from "./useMessage";
import useNotify from "../hooks/useNotify";

import Touch from "../ui/Touch";
import SidePanel from "../ui/SidePanel";

import Composer from "./Composer";
import MessageList from "./MessageList";

const StyledChat = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const NotifCount = styled.div`
  width: 2em;
  height: 2em;
  border-radius: 100%;
  position: absolute;
  top: -5px;
  right: 1.8em;
  background-color: var(--color-success);
  text-align: center;
  line-height: 2em;
  box-shadow: 3px 3px 6px #000000c0;
`;

export const MessageButton = () => {
  const { t } = useTranslation();
  const { add, reset, count } = useNotify();
  const [showPanel, setShowPanel] = React.useState(false);

  const onNewMessage = React.useCallback(() => {
    if (!showPanel) {
      add();
    }
  }, [add, showPanel]);

  React.useEffect(() => {
    if (showPanel) {
      reset();
    }
  }, [reset, showPanel]);

  const { messages, sendMessage } = useMessage(onNewMessage);

  const countStr = count > 9 ? "9+" : `${count}`;

  return (
    <>
      <div style={{ position: "relative" }}>
        <Touch
          onClick={() => setShowPanel((prev) => !prev)}
          alt={t("Chat")}
          title={t("Chat")}
          label={t("Chat")}
          icon={"message"}
          active={showPanel}
        />
        {count > 0 && <NotifCount>{countStr}</NotifCount>}
      </div>
      <SidePanel
        open={showPanel}
        onClose={() => {
          setShowPanel(false);
        }}
        position="left"
        noMargin
        title={t("Chat")}
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
