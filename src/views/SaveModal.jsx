import React from "react";
import { useTranslation } from "react-i18next";

import DownloadGameLink from "../components/DownloadGameLink";

import { updateGame } from "../utils/api";
import { useGame } from "../hooks/useGame";

import { toast } from "react-toastify";

import Modal from "../ui/Modal";

const SaveGameModal = ({ show, setShow, edit }) => {
  const { t } = useTranslation();

  const { gameId, getGame } = useGame();

  const handleSave = React.useCallback(async () => {
    const currentGame = await getGame();
    if (gameId && gameId.length > 8) {
      try {
        await updateGame(gameId, currentGame);
        toast.success(t("Game saved"), { autoClose: 1500 });
      } catch (e) {
        if (e.message === "Forbidden") {
          toast.error(t("Action forbidden. Try logging in again."));
        } else {
          console.log(e);
          toast.error(t("Error while saving game. Try again later..."));
        }
      }
    } else {
      console.log("Game not created. It's not a real one.");
    }
    setShow(false);
  }, [gameId, getGame, setShow, t]);

  return (
    <Modal title={t("Save game")} setShow={setShow} show={show}>
      {edit && (
        <button className="primary button" onClick={handleSave}>
          {t("Save game")}
        </button>
      )}
      <DownloadGameLink />
    </Modal>
  );
};

export default SaveGameModal;
