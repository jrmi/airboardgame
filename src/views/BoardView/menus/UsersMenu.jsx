import React from "react";
import { useTranslation } from "react-i18next";
import { FiLink, FiMessageSquare, FiMic, FiUsers } from "react-icons/fi";

import UserList from "../../../users/UserList";
import UserBar from "../UserBar";
import { MenuItem, TopMenu } from "./Menu";

const UsersMenu = ({ activeMenu, setActiveMenu, users }) => {
  const { t } = useTranslation();

  return (
    <TopMenu
      Icon={FiUsers}
      label={t("Users")}
      badge={users.length}
      activeMenu={activeMenu}
      setActiveMenu={setActiveMenu}
    >
      <div data-close-mobile-menu>
        <UserList showNames />
      </div>
      <UserBar
        renderMenuItems={({ openInvitation, renderChat, renderConference }) => (
          <>
            <MenuItem onClick={openInvitation}>
              <FiLink size={16} aria-hidden="true" />
              {t("Invite more player")}
            </MenuItem>
            {renderChat((onClick) => (
              <MenuItem onClick={onClick}>
                <FiMessageSquare size={16} aria-hidden="true" />
                {t("Chat")}
              </MenuItem>
            ))}
            {renderConference((onClick) => (
              <MenuItem onClick={onClick}>
                <FiMic size={16} aria-hidden="true" />
                {t("Web conference")}
              </MenuItem>
            ))}
          </>
        )}
      />
    </TopMenu>
  );
};

export default UsersMenu;
