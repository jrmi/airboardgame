import React from "react";
import { useC2C } from "./useC2C";
import debounce from "lodash.debounce";
import randomColor from "randomcolor";
import {
  atom,
  useSetRecoilState,
  useRecoilValue,
  useRecoilState,
} from "recoil";

const getUser = () => {
  if (localStorage.user) {
    const localUser = {
      name: "Player",
      color: randomColor({ luminosity: "dark" }),
      ...JSON.parse(localStorage.user),
    };
    // Id is given by server
    delete localUser.id;
    persistUser(localUser);
    return localUser;
  }
  const newUser = {
    name: "Player",
    color: randomColor({ luminosity: "dark" }),
  };
  persistUser(newUser);
  return newUser;
};

const persistUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const userAtom = atom({
  key: "user",
  default: getUser(),
});

export const usersAtom = atom({
  key: "users",
  default: [],
});

export const SubscribeUserEvents = () => {
  const usersRef = React.useRef([]);
  const setUsers = useSetRecoilState(usersAtom);
  const [currentUser, setCurrentUserState] = useRecoilState(userAtom);

  const [c2c, joined, isMaster] = useC2C();

  React.useEffect(() => {
    if (joined) {
      setCurrentUserState((prevUser) => ({
        ...prevUser,
        id: c2c.userId,
      }));
    }
  }, [joined, c2c.userId, setCurrentUserState]);

  React.useEffect(() => {
    if (joined) {
      if (!isMaster) {
        c2c.call("getUserList").then((userList) => {
          usersRef.current = userList;
          setUsers(userList);
        });
      }
    }
  }, [joined, c2c, isMaster, setUsers]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedEmitUpdateUser = React.useCallback(
    debounce((newUser) => {
      c2c.publish("userUpdate", newUser, true);
    }, 500),
    [c2c]
  );

  React.useEffect(() => {
    if (currentUser && currentUser.id) {
      debouncedEmitUpdateUser(currentUser);
    }
  }, [currentUser, debouncedEmitUpdateUser]);

  React.useEffect(() => {
    const unsub = [];
    if (joined) {
      if (isMaster) {
        c2c
          .register("getUserList", () => {
            return usersRef.current;
          })
          .then((unregister) => {
            unsub.push(unregister);
          });

        unsub.push(
          c2c.subscribe("userLeave", (userId) => {
            console.log("userLeave");
            usersRef.current = usersRef.current.filter(
              ({ id }) => id !== userId
            );
            setUsers(usersRef.current);
            console.log("publish new user list", usersRef.current);
            c2c.publish("updateUserList", usersRef.current);
          })
        );
        unsub.push(
          c2c.subscribe("userUpdate", (user) => {
            if (usersRef.current.find((u) => u.id === user.id)) {
              const newUsers = usersRef.current.map((u) =>
                u.id === user.id ? user : u
              );
              usersRef.current = newUsers;
            } else {
              const newUsers = [...usersRef.current, user];
              usersRef.current = newUsers;
            }
            setUsers(usersRef.current);
            console.log("publish new user list", usersRef.current);
            c2c.publish("updateUserList", usersRef.current);
          })
        );
      }

      unsub.push(
        c2c.subscribe("updateUserList", (newList) => {
          console.log("User list", newList);
          usersRef.current = newList;
          setUsers(usersRef.current);
        })
      );
    }

    return () => {
      unsub.forEach((u) => u());
    };
  }, [joined, c2c, isMaster, setUsers]);

  return null;
};

const useUsers = () => {
  const [currentUser, setCurrentUserState] = useRecoilState(userAtom);
  const users = useRecoilValue(usersAtom);

  const setCurrentUser = React.useCallback(
    (newUser) => {
      setCurrentUserState((prevUser) => ({ ...newUser, id: prevUser.id }));
      persistUser(newUser);
    },
    [setCurrentUserState]
  );

  return { currentUser, setCurrentUser, users };
};

export default useUsers;
