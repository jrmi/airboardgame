import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import useMessage from "../../hooks/useMessage";

import Touch from "../../ui/Touch";
import SidePanel from "../../ui/SidePanel";

import Composer from "./Composer";
import MessageList from "./MessageList";

const StyledChat = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const MessageButton = () => {
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
        position="right"
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
