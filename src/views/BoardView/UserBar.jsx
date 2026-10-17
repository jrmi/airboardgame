import React from "react";

import WebConferenceButton from "../../webconf/WebConferenceButton";

import WelcomeModal from "./WelcomeModal";
import MessageButton from "../../messages/MessageButton";

import useSession from "../../hooks/useSession";

const UserBar = ({ renderMenuItems }) => {
  const { sessionId: room } = useSession();

  const [showLink, setShowLink] = React.useState(false);

  return (
    <>
      {renderMenuItems({
        openInvitation: () => setShowLink(true),
        renderChat: (renderTrigger) => (
          <MessageButton renderTrigger={renderTrigger} />
        ),
        renderConference: (renderTrigger) => (
          <WebConferenceButton room={room} renderTrigger={renderTrigger} />
        ),
      })}
      <WelcomeModal show={showLink} setShow={setShowLink} welcome={false} />
    </>
  );
};

export default UserBar;
