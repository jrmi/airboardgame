import React from "react";
import { useUsers } from "react-sync-board";
import styled from "styled-components";

import UserConfig from "./UserConfig";

const InlineUserList = styled.ul.attrs(() => ({ className: "uk-card" }))`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const InlineUserListItem = styled.li`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  &.user-list__item--with-name {
    flex-direction: row;
    gap: 0.6em;
    width: 100%;
    padding: 0.35em 0.5em;
  }
`;

export const Users = ({ showNames = false }) => {
  const { currentUser, updateCurrentUser, localUsers: users } = useUsers();

  return (
    <InlineUserList>
      {users.map((u, index) => (
        <InlineUserListItem
          className={showNames ? "user-list__item--with-name" : undefined}
          key={u.id}
        >
          <UserConfig
            index={index + 1}
            user={u}
            updateCurrentUser={updateCurrentUser}
            editable={currentUser.id === u.id}
            showName={showNames}
          />
        </InlineUserListItem>
      ))}
    </InlineUserList>
  );
};

export default Users;
