import React from "react";

import { useTranslation } from "react-i18next";

import { FiLink, FiUsers } from "react-icons/fi";

import UserList from "../../users/UserList";
import NavButton from "../../ui/NavButton";
import WebConferenceButton from "../../webconf/WebConferenceButton";

import WelcomeModal from "./WelcomeModal";
import MessageButton from "../../messages/MessageButton";

import useSession from "../../hooks/useSession";

import { default as StyledNavBar } from "../../ui/NavBar";
import SidePanel from "../../ui/SidePanel";

const UserBar = ({ editMode = false, inline = false, renderMenuItems }) => {
  const { t } = useTranslation();
  const { sessionId: room } = useSession();

  const [showLink, setShowLink] = React.useState(false);
  const [showUsers, setShowUsers] = React.useState(false);

  const content = inline ? (
    <>
      <NavButton
        Icon={FiLink}
        onClick={() => {
          setShowLink(true);
        }}
        title={t("Invite more player")}
      />
      <NavButton
        Icon={FiUsers}
        onClick={() => setShowUsers(true)}
        title={t("Users")}
      />
      <div className="spacer" />
      {!editMode && <MessageButton />}
      <WebConferenceButton room={room} />
    </>
  ) : (
    <>
      <NavButton
        Icon={FiLink}
        onClick={() => {
          setShowLink(true);
        }}
        title={t("Invite more player")}
      />
      <div className="sep" />
      <div
        className="keep-folded invisible-scrollbar"
        style={{ overflowY: "auto" }}
      >
        <UserList />
      </div>
      <div className="spacer" />
      <div className="keep-folded">{!editMode && <MessageButton />}</div>
      <WebConferenceButton room={room} />
    </>
  );

  if (inline) {
    return (
      <>
        {renderMenuItems
          ? renderMenuItems({
              openUsers: () => setShowUsers(true),
              openInvitation: () => setShowLink(true),
              renderChat: (renderTrigger) => (
                <MessageButton renderTrigger={renderTrigger} />
              ),
              renderConference: (renderTrigger) => (
                <WebConferenceButton
                  room={room}
                  renderTrigger={renderTrigger}
                />
              ),
            })
          : content}
        <SidePanel
          open={showUsers}
          onClose={() => setShowUsers(false)}
          position="right"
          title={t("Users")}
        >
          <UserList />
          <div style={{ display: "flex", marginTop: "1em" }}>
            <MessageButton />
            <WebConferenceButton room={room} />
          </div>
        </SidePanel>
        <WelcomeModal show={showLink} setShow={setShowLink} welcome={false} />
      </>
    );
  }

  return (
    <>
      <StyledNavBar position="right" fullHeight={true}>
        {content}
      </StyledNavBar>
      <WelcomeModal show={showLink} setShow={setShowLink} welcome={false} />
    </>
  );
};

export default UserBar;
