import React from "react";
import { useTranslation } from "react-i18next";
import { useWire } from "react-sync-board";

import useSession from "../../hooks/useSession";

import Modal from "../../ui/Modal";

import LoadData from "./LoadData";

const LoadSessionModal = ({ show, setShow }) => {
  const { t } = useTranslation();
  const { wire } = useWire("board");
  const { setSession } = useSession();

  const loadSession = React.useCallback(
    (sessionData) => {
      setSession(sessionData);
      wire.publish("loadSession", sessionData);
      setShow(false);
    },
    [wire, setSession, setShow]
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
