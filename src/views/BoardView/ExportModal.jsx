import React from "react";
import { useTranslation } from "react-i18next";

import useSession from "../../hooks/useSession";
import { useItems, useBoardConfig, useMessage } from "react-sync-board";

import DownloadLink from "./DownloadLink";
import Modal from "../../ui/Modal";

const ExportModal = ({ show, setShow }) => {
  const { t } = useTranslation();
  const { gameId, availableItems } = useSession();
  const items = useItems();
  const [boardConfig] = useBoardConfig();
  const { messages } = useMessage();

  const getSession = React.useCallback(() => {
    const currentSession = {
      items: items,
      board: boardConfig,
      availableItems: availableItems,
      messages: messages.slice(-50),
      timestamp: Date.now(),
      gameId: gameId,
    };
    return currentSession;
  }, [availableItems, boardConfig, gameId, items, messages]);

  return (
    <Modal title={t("Save game")} setShow={setShow} show={show}>
      <header>
        <h3>{t("Want to continue later?")}</h3>
      </header>
      <section>
        <p>
          {t(
            "You can save the current session on your computer to load it later!"
          )}
        </p>
        <DownloadLink getData={getSession} />
      </section>
    </Modal>
  );
};

export default ExportModal;
