import React from 'react';
import UserName from './UserName';

export const Users = ({ user, setUser, users }) => (
  <ul
    style={{
      position: 'fixed',
      right: '1em',
      top: '1em',
      background: '#ffffff77',
      padding: '0.2em',
      listStyle: 'none',
    }}
  >
    {users.map((u, index) => (
      <li key={u.id} style={{ color: u.color }}>
        <span>{index} - </span>
        {user.id === u.id && <UserName user={user} setUser={setUser} />}
        {user.id !== u.id && <span>{u.name}</span>}
      </li>
    ))}
  </ul>
);

export default Users;
