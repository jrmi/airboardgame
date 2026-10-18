import React from "react";
import { useTranslation } from "react-i18next";
import { FiLink, FiMessageSquare, FiMic, FiUsers } from "react-icons/fi";

import UserList from "../../../users/UserList";
import UserBar from "../UserBar";
import { MenuBadge, MenuItem, TopMenu } from "./Menu";

const UsersMenu = ({
  activeMenu,
  setActiveMenu,
  users,
  notificationCount,
  onUnreadMessageCountChange,
}) => {
  const { t } = useTranslation();

  return (
    <TopMenu
      Icon={FiUsers}
      label={t("player", { count: users.length })}
      notificationCount={notificationCount}
      activeMenu={activeMenu}
      setActiveMenu={setActiveMenu}
    >
      <div data-close-mobile-menu>
        <UserList showNames />
      </div>
      <UserBar
        onUnreadMessageCountChange={onUnreadMessageCountChange}
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
                {notificationCount > 0 && (
                  <MenuBadge $notification>
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </MenuBadge>
                )}
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
