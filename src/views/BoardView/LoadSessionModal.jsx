import React from "react";
import { useTranslation } from "react-i18next";

import useSession from "../../hooks/useSession";

import Modal from "../../ui/Modal";

import LoadData from "./LoadData";

const LoadSessionModal = ({ show, setShow }) => {
  const { t } = useTranslation();
  const { setSession } = useSession();

  const loadSession = React.useCallback(
    (sessionData) => {
      setSession(sessionData);
      setShow(false);
    },
    [setSession, setShow]
  );

  return (
    <Modal title={t("Load session")} setShow={setShow} show={show}>
      <header>
        <h3>{t("Continue a saved game session?")}</h3>
      </header>
      <section>
        <LoadData onLoad={loadSession} />
      </section>
    </Modal>
  );
};

export default LoadSessionModal;
