import React from "react";
import { useParams, Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const AuthView = () => {
  const { userHash, token } = useParams();
  const [logged, setLogged] = React.useState(false);

  const { login } = useAuth();

  React.useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      await login(userHash, token);
      if (!isMounted) return;
      setLogged(true);
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [login, token, userHash]);

  if (logged) {
    return <Navigate to="/games" />;
  }

  return (
    <div>
      <h1>Login in progress</h1>
    </div>
  );
};

export default AuthView;
