import React from 'react';
import { useC2C } from './useC2C';
import randomColor from 'randomcolor';

function useUser() {
  const [user, setUserState] = React.useState({});
  const [c2c, joined] = useC2C();

  React.useEffect(() => {
    if (joined) {
      setUserState((prevUser) => ({
        ...prevUser,
        id: c2c.userId,
        color: randomColor({ luminosity: 'dark' }),
      }));
    }
  }, [joined, c2c.userId]);

  const setUser = React.useCallback((newUser) => {
    setUserState((prevUser) => ({ ...newUser, id: prevUser.id }));
  }, []);

  React.useEffect(() => {
    if (user && user.id) {
      console.log('publish user', user);
      c2c.publish('userUpdate', user, true);
    }
  }, [user, c2c]);

  return [user, setUser];
}

export default useUser;
