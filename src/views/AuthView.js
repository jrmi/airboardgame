import React from "react";
import { useParams, Redirect } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const AuthView = () => {
  const { userHash, token } = useParams();
  const [logged, setLogged] = React.useState(false);

  const { login } = useAuth();

  React.useEffect(() => {
    const verify = async () => {
      await login(userHash, token);
      setLogged(true);
    };
    verify();
  }, [login, token, userHash]);

  if (logged) {
    return <Redirect to="/games" />;
  }

  return (
    <div>
      <h1>Login in progress</h1>
    </div>
  );
};

export default AuthView;
