import React from "react";
import { useTranslation } from "react-i18next";
import { Trans } from "react-i18next";

import Modal from "../ui/Modal";

const WelcomeModal = ({ show, setShow }) => {
  const { t } = useTranslation();
  const currentUrl = window.location.href;

  return (
    <Modal
      title={t("Ready to play ?")}
      setShow={setShow}
      show={show}
      footer={
        <button
          onClick={() => {
            setShow(false);
          }}
          className="button"
        >
          {t("I want to play...")}
        </button>
      }
    >
      <h3>{t("Invite your friends")}</h3>
      <Trans i18nKey="InviteFriends">
        <p>
          To invite other players to play with you, share the following link
          with your friends.
        </p>
      </Trans>
      <span>{currentUrl}</span>

      <h3>{t("More information")}</h3>
      <Trans i18nKey="moreInformation">
        <p>
          For more information, visit{" "}
          <a href="https://github.com/jrmi/airboardgame/">github repository</a>.
        </p>
      </Trans>
    </Modal>
  );
};

export default WelcomeModal;
