import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import Modal from "../ui/Modal";
import useAuth from "../hooks/useAuth";

import Waiter from "../ui/Waiter";

const Account = ({ disabled, ...props }) => {
  const { t } = useTranslation();
  const {
    isAuthenticated,
    login,
    logout,
    passwordReset,
    createAccountAndLogin,
  } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const [showLogin, setShowLogin] = React.useState(false);
  const [loginInProgress, setLoginInProgress] = React.useState(false);

  const handleSubmit = async () => {
    try {
      setLoginInProgress(true);
      await login(email, password);
      setSuccess(true);
    } catch (e) {
      console.log(e);
      toast.error(t("Error while logging, verify your email address"));
    } finally {
      setLoginInProgress(false);
    }
  };

  const handleReset = async () => {
    await passwordReset(email);
  };

  const handleCreate = async () => {
    try {
      setLoginInProgress(true);
      await createAccountAndLogin(email, password);
      setSuccess(true);
    } catch (e) {
      console.log(e);
      toast.error(t("Error while logging, verify your email address"));
    } finally {
      setLoginInProgress(false);
    }
  };

  const showAlert = () => {
    alert(t("Cookie are disabled or not yet accepted, can't connect"));
  };

  React.useEffect(() => {
    if (!showLogin) {
      setEmail("");
      setSuccess(false);
    }
  }, [showLogin]);

  if (disabled) {
    return (
      <div {...props}>
        <button
          onClick={showAlert}
          title={t("Cookie are disabled or not yet accepted, can't connect")}
          style={{ opacity: 0.4, cursor: "not-allowed" }}
        >
          {t("Login")}
        </button>
      </div>
    );
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <>
      <div {...props}>
        {isAuthenticated ? (
          <button onClick={logout}>{t("Logout")}</button>
        ) : (
          <button onClick={() => setShowLogin(true)}>{t("Login")}</button>
        )}
      </div>
      {loginInProgress && <Waiter message={t("In progress...")} />}

      <Modal
        show={!success && showLogin}
        setShow={setShowLogin}
        title={t("Login")}
        width="33%"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "1em",
            padding: "1em 2em",
            width: "500px",
          }}
        >
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("Enter your email here")}
            onKeyDown={handleKeyDown}
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder={t("Password...")}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleCreate} className="button">
            {t("Create account")}
          </button>
          <span />
          <button onClick={handleReset} className="button">
            {t("Password reset")}
          </button>
          <span />
          <button onClick={handleSubmit} className="button success">
            {t("Authenticate")}
          </button>
        </div>
      </Modal>

      {success && (
        <Modal
          show={showLogin}
          setShow={setShowLogin}
          title={t("Login")}
          width="33%"
        >
          <p>{t("Successfully loggued in.")}</p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "2em",
            }}
          >
            <button
              className="button success"
              onClick={() => setShowLogin(false)}
            >
              Ok
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default Account;
