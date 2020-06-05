import React from 'react';

export const Users = ({ users, userId }) => (
  <div
    style={{
      position: 'fixed',
      right: '1em',
      background: '#ffffff77',
      padding: '0.2em',
    }}
  >
    {users.map((u) => (
      <p key={u.id} style={{ color: u.color }}>
        {u.id} {userId === u.id && '<You'}
      </p>
    ))}
  </div>
);

export default Users;
