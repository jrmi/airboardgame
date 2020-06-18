import React from 'react';
import { useC2C } from './useC2C';
import randomColor from 'randomcolor';
import debounce from 'lodash.debounce';
import { atom, useRecoilState } from 'recoil';

const getUser = () => {
  if (localStorage.user) {
    const localUser = {
      name: 'Player',
      color: randomColor({ luminosity: 'dark' }),
      ...JSON.parse(localStorage.user),
    };
    // Id is given by server
    delete localUser.id;
    persistUser(localUser);
    return localUser;
  }
  const newUser = {
    name: 'Player',
    color: randomColor({ luminosity: 'dark' }),
  };
  persistUser(newUser);
  return newUser;
};

const persistUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const userAtom = atom({
  key: 'user',
  default: getUser(),
});

function useUser() {
  const [user, setUserState] = useRecoilState(userAtom);
  const [c2c, joined] = useC2C();

  React.useEffect(() => {
    if (joined) {
      setUserState((prevUser) => ({
        ...prevUser,
        id: c2c.userId,
      }));
    }
  }, [joined, c2c.userId, setUserState]);

  const setUser = React.useCallback(
    (newUser) => {
      setUserState((prevUser) => ({ ...newUser, id: prevUser.id }));
      persistUser(newUser);
    },
    [setUserState]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedEmitUpdateUser = React.useCallback(
    debounce((newUser) => {
      c2c.publish('userUpdate', newUser, true);
    }, 500),
    [c2c]
  );

  React.useEffect(() => {
    if (user && user.id) {
      debouncedEmitUpdateUser(user);
    }
  }, [user, debouncedEmitUpdateUser]);

  return [user, setUser];
}

export default useUser;
