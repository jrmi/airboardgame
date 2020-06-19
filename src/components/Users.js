import React from "react";
import UserConfig from "./UserConfig";

import styled from "styled-components";

const UserList = styled.ul`
  position: fixed;
  right: 1em;
  top: 1em;
  background: #ffffff77;
  padding: 0.2em;
  list-style: none;
`;

const UserListItem = styled.li`
  display: flex;
  position: relative;
`;

const UserListIndex = styled.span`
  line-height: 30px;
`;

export const Users = ({ user, setUser, users }) => (
  <UserList>
    {users.map((u, index) => (
      <UserListItem key={u.id}>
        <UserListIndex>{index} - </UserListIndex>
        <UserConfig user={u} setUser={setUser} editable={user.id === u.id} />
      </UserListItem>
    ))}
  </UserList>
);

export default Users;
