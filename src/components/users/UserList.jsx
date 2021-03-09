import React from "react";
import UserConfig from "./UserConfig";
import useUsers from "./useUsers";

import styled from "styled-components";

const UserList = styled.ul.attrs(() => ({ className: "uk-card" }))`
  list-style: none;
  margin: 0;
  display: flex;
`;

const UserListItem = styled.li`
  display: flex;
  align-items: center;
`;

export const Users = () => {
  const { currentUser, setCurrentUser, users } = useUsers();

  return (
    <UserList>
      {users.map((u, index) => (
        <UserListItem key={u.id}>
          <UserConfig
            index={index + 1}
            user={u}
            setUser={setCurrentUser}
            editable={currentUser.id === u.id}
          />
        </UserListItem>
      ))}
    </UserList>
  );
};

export default Users;
