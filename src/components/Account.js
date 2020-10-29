import React from "react";
import { useTranslation } from "react-i18next";
import Modal from "../ui/Modal";
import { sendAuthToken } from "../utils/api";
import useAuth from "../hooks/useAuth";

const Account = (props) => {
  const { t } = useTranslation();
  const { isAuthenticated, logout } = useAuth();
  const [email, setEmail] = React.useState("");
  const [emailSent, setEmailSent] = React.useState(false);
  const [showLogin, setShowLogin] = React.useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = () => {
    sendAuthToken(email);
    setEmailSent(true);
  };

  React.useEffect(() => {
    if (!showLogin) {
      setEmail("");
      setEmailSent(false);
    }
  }, [showLogin]);

  return (
    <>
      <div {...props}>
        {isAuthenticated ? (
          <button onClick={logout}>{t("Logout")}</button>
        ) : (
          <button onClick={() => setShowLogin(true)}>{t("Login")}</button>
        )}
      </div>
      <Modal show={showLogin} setShow={setShowLogin} title={t("Login")}>
        {!emailSent && (
          <>
            <input
              value={email}
              onChange={handleChange}
              placeholder={t("Enter your email here")}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "2em",
              }}
            >
              <button onClick={handleSubmit} className="button primary">
                {t("Ask authentication link")}
              </button>
            </div>
          </>
        )}
        {emailSent && (
          <>
            <p>
              {t("Mail sent, check your inbox and click the link to login.")}
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "2em",
              }}
            >
              <button
                className="button primary"
                onClick={() => setShowLogin(false)}
              >
                Ok
              </button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default Account;
