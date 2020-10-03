import React from "react";
import { login as loginAPI, logout as logoutAPI } from "../utils/api";
import useLocalStorage from "../hooks/useLocalStorage";

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage(
    "isAuthenticated",
    false
  );
  const [userId, setUserId] = useLocalStorage("userId", null);

  const login = React.useCallback(
    async (userHash, token) => {
      await loginAPI(userHash, token);
      setIsAuthenticated(true);
      setUserId(userHash);
    },
    [setIsAuthenticated, setUserId]
  );

  const logout = React.useCallback(async () => {
    await logoutAPI();
    setIsAuthenticated(false);
    setUserId(null);
  }, [setIsAuthenticated, setUserId]);

  return {
    isAuthenticated,
    userId,
    login,
    logout,
  };
};

export default useAuth;
