import React from "react";

import { useTranslation } from "react-i18next";

import { FiLink } from "react-icons/fi";

import UserList from "../../users/UserList";
import NavButton from "../../ui/NavButton";
import WebConferenceButton from "../../webconf/WebConferenceButton";

import WelcomeModal from "./WelcomeModal";
import MessageButton from "../../messages/MessageButton";

import useSession from "../../hooks/useSession";

import { default as StyledNavBar } from "../../ui/NavBar";

const UserBar = ({ editMode }) => {
  const { t } = useTranslation();
  const { sessionId: room } = useSession();

  const [showLink, setShowLink] = React.useState(false);

  return (
    <>
      <StyledNavBar position="right" fullHeight={true}>
        <NavButton
          Icon={FiLink}
          onClick={() => {
            setShowLink(true);
          }}
          title={t("Invite more player")}
        />
        <div className="sep" />
        <UserList />
        <div className="spacer" />
        {!editMode && <MessageButton />}
        <WebConferenceButton room={room} />
      </StyledNavBar>
      <WelcomeModal show={showLink} setShow={setShowLink} welcome={false} />
    </>
  );
};

export default UserBar;
