import React from "react";
import { useTranslation } from "react-i18next";

import LoadData from "./LoadData";

import useC2C from "../../hooks/useC2C";
import useSession from "../../hooks/useSession";

import Modal from "../../ui/Modal";

const LoadSessionModal = ({ show, setShow }) => {
  const { t } = useTranslation();
  const { c2c } = useC2C("board");
  const { setSession } = useSession();

  const loadSession = React.useCallback(
    (sessionData) => {
      setSession(sessionData);
      c2c.publish("loadSession", sessionData);
      setShow(false);
    },
    [c2c, setSession, setShow]
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
