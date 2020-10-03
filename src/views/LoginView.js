import React from "react";
import { sendAuthToken } from "../utils/api";

const LoginView = () => {
  const [email, setEmail] = React.useState("test@yopmail.com");
  const handleChange = (e) => {
    setEmail(e.target.value);
  };
  const handleSubmit = () => {
    sendAuthToken(email);
  };
  return (
    <div>
      <h1>Login</h1>
      <input value={email} onChange={handleChange} />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default LoginView;
