import React from "react";
import UserConfig from "./UserConfig";

export const Users = ({ user, setUser, users }) => (
  <ul
    style={{
      position: "fixed",
      right: "1em",
      top: "1em",
      background: "#ffffff77",
      padding: "0.2em",
      listStyle: "none",
    }}
  >
    {users.map((u, index) => (
      <li key={u.id} style={{ display: "flex", position: "relative" }}>
        <span style={{ lineHeight: "30px" }}>{index} - </span>
        <UserConfig user={u} setUser={setUser} editable={user.id === u.id} />
      </li>
    ))}
  </ul>
);

export default Users;
