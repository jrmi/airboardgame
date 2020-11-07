import React from "react";
import { useTranslation } from "react-i18next";

import DownloadGameLink from "../components/DownloadGameLink";
import LoadGame from "../components/LoadGame";

import { useC2C } from "../hooks/useC2C";
import { nanoid } from "nanoid";

import { updateGame } from "../utils/api";
import { useGame } from "../hooks/useGame";

import { toast } from "react-toastify";

import Modal from "../ui/Modal";

const LoadSaveGameModal = ({ show, setShow, edit }) => {
  const { t } = useTranslation();
  const [c2c] = useC2C();

  const { gameId, getGame } = useGame();

  const loadGame = React.useCallback(
    (game) => {
      game.items = game.items.map((item) => ({ ...item, id: nanoid() }));
      c2c.publish("loadGame", game, true);
      setShow(false);
    },
    [c2c, setShow]
  );

  const handleSave = React.useCallback(async () => {
    const currentGame = await getGame();
    if (gameId && gameId.length > 8) {
      try {
        await updateGame(gameId, currentGame);
        toast.success(t("Game saved"), { autoClose: 1500 });
      } catch (e) {
        console.log(e);
        toast.error(t("Error while saving game. Try again later..."));
      }
    } else {
      console.log("Game not created. It's not a real one.");
    }
    setShow(false);
  }, [gameId, getGame, setShow, t]);

  return (
    <Modal
      title={t("Save")}
      setShow={setShow}
      show={show}
      footer={
        <div style={{ display: "flex", justifyContent: "end" }}>
          <button
            onClick={() => {
              setShow(false);
            }}
            className="button"
          >
            {t("Close")}
          </button>
        </div>
      }
    >
      {edit && (
        <button className="primary button" onClick={handleSave}>
          {t("Save game")}
        </button>
      )}
      <LoadGame onLoad={loadGame} />
      <DownloadGameLink />
    </Modal>
  );
};

export default LoadSaveGameModal;
