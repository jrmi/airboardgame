import React from "react";
import { useTranslation } from "react-i18next";

import useGame from "../../hooks/useGame";

import Modal from "../../ui/Modal";

import LoadData from "./LoadData";

const LoadGameModal = ({ show, setShow }) => {
  const { t } = useTranslation();
  const { setGame } = useGame();

  const loadGame = React.useCallback(
    (game) => {
      setGame(game);
      setShow(false);
    },
    [setGame, setShow]
  );

  return (
    <Modal title={t("Load game")} setShow={setShow} show={show}>
      <header>
        <h3>{t("Load previously exported work?")}</h3>
      </header>
      <section>
        <LoadData onLoad={loadGame} />
      </section>
    </Modal>
  );
};

export default LoadGameModal;
