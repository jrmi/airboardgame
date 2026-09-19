import React from "react";
import { useParams, Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useTranslation } from "react-i18next";
import Waiter from "../ui/Waiter";

const authRequests = new Map();

const AuthView = () => {
  const { userHash, token } = useParams();
  const [logged, setLogged] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  const { t } = useTranslation();

  const { login } = useAuth();

  React.useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      try {
        const requestKey = `${userHash}:${token}`;
        let authRequest = authRequests.get(requestKey);
        if (!authRequest) {
          authRequest = login(userHash, token);
          authRequests.set(requestKey, authRequest);
          authRequest.catch(() => authRequests.delete(requestKey));
        }
        await authRequest;
        if (!isMounted) return;
        setLogged(true);
      } catch (e) {
        if (!isMounted) return;
        setFailed(true);
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [login, token, userHash]);

  if (failed) {
    return (
      <div>
        <h1>{t("Login failed. Please try again.")}</h1>
        <a href="/">{t("Home")}</a>
      </div>
    );
  }

  if (logged) {
    return <Navigate to="/games" />;
  }

  return <Waiter />;
};

export default AuthView;
