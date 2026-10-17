import React from "react";

import { useTranslation } from "react-i18next";
import { useWire } from "react-sync-board";
import { FiLink, FiMic, FiUsers } from "react-icons/fi";

import NavBar from "../../ui/NavBar";
import UserList from "../../users/UserList";
import WebConferenceButton from "../../webconf/WebConferenceButton";
import InviteModal from "./InviteModal";
import { MenuItem, TopMenu } from "../BoardView/menus/Menu";

import { useLocation, useNavigate } from "react-router-dom";

const RoomNavBar = () => {
  const { t } = useTranslation();
  const { room } = useWire("room");
  const { state } = useLocation();
  const navigate = useNavigate();

  const [showInvite, setShowInvite] = React.useState(
    state ? state.showInvite : undefined
  );
  const [activeMenu, setActiveMenu] = React.useState(null);

  return (
    <>
      <NavBar position="top" fullHeight={false} onClose={() => navigate("/")}>
        <TopMenu
          Icon={FiUsers}
          label={t("Users")}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
        >
          <div data-close-mobile-menu>
            <UserList showNames />
          </div>
          <MenuItem onClick={() => setShowInvite(true)}>
            <FiLink size={16} aria-hidden="true" />
            {t("Invite more player")}
          </MenuItem>
          <WebConferenceButton
            room={room}
            renderTrigger={(onClick) => (
              <MenuItem onClick={onClick}>
                <FiMic size={16} aria-hidden="true" />
                {t("Web conference")}
              </MenuItem>
            )}
          />
        </TopMenu>
      </NavBar>
      <InviteModal show={showInvite} setShow={setShowInvite} />
    </>
  );
};

export default RoomNavBar;
