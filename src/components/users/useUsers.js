import React from "react";
import { useRecoilValue, useRecoilState } from "recoil";
import { userAtom, usersAtom, persistUser } from "./atoms";

const useUsers = () => {
  const [currentUser, setCurrentUserState] = useRecoilState(userAtom);
  const users = useRecoilValue(usersAtom);

  const setCurrentUser = React.useCallback(
    (callbackOrUser) => {
      let callback = callbackOrUser;
      if (typeof callbackOrUser === "object") {
        callback = () => callbackOrUser;
      }
      setCurrentUserState((prevUser) => {
        const newUser = { ...callback(prevUser), id: prevUser.id };
        persistUser(newUser);
        return newUser;
      });
    },
    [setCurrentUserState]
  );

  return { currentUser, setCurrentUser, users };
};

export default useUsers;
