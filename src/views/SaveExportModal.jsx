import React from "react";
import { useTranslation } from "react-i18next";

import DownloadGameLink from "../components/DownloadGameLink";

import { updateGame } from "../utils/api";
import { useGame } from "../hooks/useGame";

import { toast } from "react-toastify";

import Modal from "../ui/Modal";

const SaveExportGameModal = ({ show, setShow }) => {
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
    <Modal title={t("Save & export")} setShow={setShow} show={show}>
      <>
        <header>
          <h3>{t("Save you work?")}</h3>
        </header>
        <section>
          <p>
            {t(
              "You game will be saved and you can access it later in the studio!"
            )}
          </p>
          <p>
            {t(
              "If you have checked the publish checkbox your game will be public."
            )}
          </p>
          <button className="primary button icon" onClick={handleSave}>
            {t("Save game")}
            <img
              src={"https://icongr.am/entypo/save.svg?size=24&color=f9fbfa"}
              alt="icon"
            />
          </button>
        </section>
        <header>
          <h3>{t("Export the board?")}</h3>
        </header>
        <section>
          <p>{t("You can also save it to your computer.")}</p>
          <DownloadGameLink />
        </section>
      </>
    </Modal>
  );
};

export default SaveExportGameModal;
