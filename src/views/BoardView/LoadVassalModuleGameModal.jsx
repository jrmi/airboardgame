import React from "react";
import { useTranslation } from "react-i18next";

import useSession from "../../hooks/useSession";

import Modal from "../../ui/Modal";

import LoadVassalModule from "./LoadVassalModule";

const LoadVassalGameModal = ({ show, setShow }) => {
  const { t } = useTranslation();
  const { setSession } = useSession();

  const onLoad = React.useCallback(
    (newSession) => {
      setSession(newSession);
      setShow(false);
    },
    [setSession, setShow]
  );

  return (
    <Modal title={t("Load Vassal module")} setShow={setShow} show={show}>
      <header>
        <h3>{t("Load a Vassal module?")}</h3>
      </header>
      <section>
        <LoadVassalModule onLoad={onLoad} />
      </section>
    </Modal>
  );
};

export default LoadVassalGameModal;
