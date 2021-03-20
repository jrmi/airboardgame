import React from "react";
import UserConfig from "./UserConfig";
import useUsers from "./useUsers";
import Touch from "../../ui/Touch";
import { useTranslation } from "react-i18next";

import styled from "styled-components";
import DropDown from "../../ui/DropDown";

const InlineUserList = styled.ul.attrs(() => ({ className: "uk-card" }))`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
`;

const InlineUserListItem = styled.li`
  display: flex;
  align-items: center;
  position: relative;
  margin-right: 3px;
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
  const { currentUser, setCurrentUser, users } = useUsers();
  const [openUserlist, setOpenUserList] = React.useState(false);

  const firstUsers = users.slice(0, 3);

  return (
    <InlineUserList>
      {firstUsers.map((u, index) => (
        <InlineUserListItem key={u.id}>
          <UserConfig
            index={index + 1}
            user={u}
            setUser={setCurrentUser}
            editable={currentUser.id === u.id}
          />
        </InlineUserListItem>
      ))}
      {users.length > 3 && (
        <InlineUserListItem key="last">
          <div style={{ display: "inline" }}>
            <Touch
              onClick={() => {
                setOpenUserList((prev) => !prev);
              }}
              icon="dots-three-horizontal"
              title={t("All players")}
            />
            <DropDown open={openUserlist}>
              <UserList>
                {users.map((u, index) => (
                  <UserListItem key={u.id}>
                    <UserConfig
                      index={index + 1}
                      user={u}
                      setUser={setCurrentUser}
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
