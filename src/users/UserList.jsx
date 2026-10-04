import React from "react";
import { useUsers } from "react-sync-board";
import styled from "styled-components";

import UserConfig from "./UserConfig";
import useUniqueUsername from "./useUniqueUsername";

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
`;

export const Users = () => {
  const { currentUser, updateCurrentUser, localUsers: users } = useUsers();

  // Belt-and-suspenders: also runs earlier, before the board finishes
  // loading, via useUniqueUsername() in Session/Room — see there for why.
  useUniqueUsername();

  return (
    <InlineUserList>
      {users.map((u, index) => (
        // Keyed by the persisted uid, not the ephemeral connection id, so a
        // reconnect mid-edit doesn't remount UserConfig and silently drop
        // its open "User details" modal / in-progress name edit.
        <InlineUserListItem key={u.uid}>
          <UserConfig
            index={index + 1}
            user={u}
            updateCurrentUser={updateCurrentUser}
            editable={currentUser.id === u.id}
            existingNames={users
              .filter((other) => other.id !== u.id)
              .map((other) => other.name)}
          />
        </InlineUserListItem>
      ))}
    </InlineUserList>
  );
};

export default Users;
