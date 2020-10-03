import React from "react";
import { login as loginAPI, logout as logoutAPI } from "../utils/api";
import useLocalStorage from "../hooks/useLocalStorage";

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage(
    "isAuthenticated",
    false
  );
  const [userId, setUserId] = useLocalStorage("userId", null);
  const mountedRef = React.useRef(true);

  const login = React.useCallback(
    async (userHash, token) => {
      await loginAPI(userHash, token);
      if (!mountedRef.current) return;
      setIsAuthenticated(true);
      setUserId(userHash);
    },
    [setIsAuthenticated, setUserId]
  );

  const logout = React.useCallback(async () => {
    await logoutAPI();
    if (!mountedRef.current) return;
    setIsAuthenticated(false);
    setUserId(null);
  }, [setIsAuthenticated, setUserId]);

  React.useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    isAuthenticated,
    userId,
    login,
    logout,
  };
};

export default useAuth;
