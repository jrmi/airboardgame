import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import DownloadLink from "./DownloadLink";
import Modal from "../../ui/Modal";
import useGame from "../../hooks/useGame";

const SaveExportGameModal = ({ show, setShow }) => {
  const { t } = useTranslation();

  const { saveGame, getGame } = useGame();

  const handleSave = React.useCallback(async () => {
    try {
      await saveGame();
      toast.success(t("Game saved"), { autoClose: 1500 });
    } catch (e) {
      if (e.message === "Forbidden") {
        toast.error(t("Action forbidden. Try logging in again."));
      } else {
        console.log(e);
        toast.error(t("Error while saving game. Try again later..."));
      }
    }
    setShow(false);
  }, [saveGame, setShow, t]);

  React.useEffect(() => {
    const callback = (e) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", callback);
    return () => window.removeEventListener("keydown", callback);
  }, [handleSave]);

  return (
    <Modal title={t("Save & export")} setShow={setShow} show={show}>
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
        <button className="success button icon" onClick={handleSave}>
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
        <DownloadLink getData={getGame} />
      </section>
    </Modal>
  );
};

export default SaveExportGameModal;
