import React from "react";
import { useQuery } from "react-query";
import {
  authenticate,
  logout as logoutAPI,
  refresh,
  getAccount,
  passwordReset,
  confirmPasswordReset,
  requestVerification,
  createAccount,
} from "../utils/api";
import useLocalStorage from "../hooks/useLocalStorage";

const refreshInterval = 60 * 1000;

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage(
    "isAuthenticated",
    false
  );
  const [userId, setUserId] = useLocalStorage("userId", null);
  const [lastRefresh, setLastRefresh] = useLocalStorage("lastRefresh", null);

  const { data: userAccount } = useQuery("account", async () =>
    isAuthenticated ? await getAccount(userId) : null
  );

  const login = React.useCallback(
    async (email, password) => {
      const user = await authenticate(email, password);
      setIsAuthenticated(true);
      setUserId(user.id);
      setLastRefresh(Date.now());
    },
    [setIsAuthenticated, setLastRefresh, setUserId]
  );

  const createAccountAndLogin = React.useCallback(
    async (email, password) => {
      await createAccount(email, password);
      await login(email, password);
    },
    [login]
  );

  const logout = React.useCallback(async () => {
    await logoutAPI();
    setIsAuthenticated(false);
    setUserId(null);
    setLastRefresh(null);
  }, [setIsAuthenticated, setLastRefresh, setUserId]);

  React.useEffect(() => {
    const checkAuth = async () => {
      const now = Date.now();

      if (!lastRefresh || now - lastRefresh > refreshInterval) {
        const authResult = await refresh();
        if (!authResult) {
          setIsAuthenticated(false);
        } else {
          setLastRefresh(now);
        }
      }
    };

    if (isAuthenticated) {
      checkAuth();
    }
  }, [
    isAuthenticated,
    lastRefresh,
    setIsAuthenticated,
    setLastRefresh,
    userId,
  ]);

  return {
    isAuthenticated,
    userId,
    login,
    logout,
    passwordReset,
    confirmPasswordReset,
    requestVerification,
    createAccountAndLogin,
    userAccount,
  };
};

export default useAuth;
