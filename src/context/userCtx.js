import React from 'react';

export const UserContext = React.createContext([]);

export const UserProvider = UserContext.Provider;

export default { UserContext, UserProvider };
