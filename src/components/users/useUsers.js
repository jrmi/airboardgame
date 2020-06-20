import React from "react";
import { useRecoilValue, useRecoilState } from "recoil";
import { userAtom, usersAtom, persistUser } from "./atoms";

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
