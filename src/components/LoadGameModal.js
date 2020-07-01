import React from "react";
import { useTranslation } from "react-i18next";

import { useC2C } from "../hooks/useC2C";
import { nanoid } from "nanoid";

import LoadGame from "./LoadGame";

import Modal from "./Modal";

export const LoadGameModal = ({ setShowModal, showModal }) => {
  const { t } = useTranslation();
  const [c2c] = useC2C();

  const loadGame = React.useCallback(
    (game) => {
      game.items = game.items.map((item) => ({ ...item, id: nanoid() }));
      c2c.publish("loadGame", game, true);
      setShowModal(false);
    },
    [c2c, setShowModal]
  );

  if (!showModal) {
    return null;
  }

  return (
    <Modal
      title={t("Load game")}
      setShow={setShowModal}
      show={showModal}
      footer={
        <button
          onClick={() => {
            setShowModal(false);
          }}
          className="button dangerous"
        >
          {t("Cancel")}
        </button>
      }
    >
      <LoadGame onLoad={loadGame} />
    </Modal>
  );
};

export default LoadGameModal;
