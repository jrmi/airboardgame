import React from "react";
import { useUsers } from "react-sync-board";
import styled from "styled-components";

import { useTranslation } from "react-i18next";

import { FiMoreHorizontal } from "react-icons/fi";

import DropDown from "../ui/DropDown";
import UserConfig from "./UserConfig";
import NavButton from "../ui/NavButton";

const InlineUserList = styled.ul.attrs(() => ({ className: "uk-card" }))`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
`;

const InlineUserListItem = styled.li`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const UserList = styled.ul.attrs(() => {})`
  list-style: none;
  margin: 0;
  padding: 1em;
`;

const UserListItem = styled.li`
  display: flex;
  max-width: 300px;
  align-items: center;
  padding: 0.4em 0;
  & .name {
    flex: 1;
    margin-left: 1em;
  }
`;

export const Users = () => {
  const { t } = useTranslation();
  const { currentUser, updateCurrentUser, localUsers: users } = useUsers();
  const [openUserlist, setOpenUserList] = React.useState(false);

  const firstUsers = users.slice(0, 3);

  return (
    <InlineUserList>
      {firstUsers.map((u, index) => (
        <InlineUserListItem key={u.id}>
          <UserConfig
            index={index + 1}
            user={u}
            updateCurrentUser={updateCurrentUser}
            editable={currentUser.id === u.id}
          />
        </InlineUserListItem>
      ))}
      {users.length > 3 && (
        <InlineUserListItem key="last">
          <div>
            <NavButton
              onClick={() => {
                setOpenUserList((prev) => !prev);
              }}
              Icon={FiMoreHorizontal}
              title={t("All players")}
            />
            <DropDown open={openUserlist}>
              <UserList>
                {users.map((u, index) => (
                  <UserListItem key={u.id}>
                    <UserConfig
                      index={index + 1}
                      user={u}
                      updateCurrentUser={updateCurrentUser}
                      editable={currentUser.id === u.id}
                    />
                    <div className="name">{u.name}</div>
                  </UserListItem>
                ))}
              </UserList>
            </DropDown>
          </div>
        </InlineUserListItem>
      )}
    </InlineUserList>
  );
};

export default Users;
