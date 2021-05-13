import React from "react";
import { useTranslation } from "react-i18next";

import LoadGame from "../../components/LoadGame";

import { useC2C } from "../../hooks/useC2C";
import { nanoid } from "nanoid";

import Modal from "../../ui/Modal";

const LoadGameModal = ({ show, setShow }) => {
  const { t } = useTranslation();
  const { c2c } = useC2C();

  const loadGame = React.useCallback(
    (game) => {
      game.items = game.items.map((item) => ({ ...item, id: nanoid() }));
      c2c.publish("loadGame", game, true);
      setShow(false);
    },
    [c2c, setShow]
  );

  return (
    <Modal title={t("Load game")} setShow={setShow} show={show}>
      <>
        <header>
          <h3>{t("Load previously exported work?")}</h3>
        </header>
        <section>
          <LoadGame onLoad={loadGame} />
        </section>
      </>
    </Modal>
  );
};

export default LoadGameModal;
