import React from 'react';

const UserName = ({ user, setUser }) => {
  const handleChange = (e) => {
    setUser({ ...user, name: e.target.value });
  };

  return <input value={user.name} onChange={handleChange} />;
};

export default UserName;
