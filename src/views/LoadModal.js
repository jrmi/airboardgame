import React from "react";
import { useTranslation } from "react-i18next";

import LoadGame from "../components/LoadGame";

import { useC2C } from "../hooks/useC2C";
import { nanoid } from "nanoid";

import Modal from "../ui/Modal";

const LoadSaveGameModal = ({ show, setShow }) => {
  const { t } = useTranslation();
  const [c2c] = useC2C();

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
      <LoadGame onLoad={loadGame} />
    </Modal>
  );
};

export default LoadSaveGameModal;
