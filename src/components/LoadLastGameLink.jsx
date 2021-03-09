import React from "react";
import { useTranslation } from "react-i18next";

import { useC2C } from "../hooks/useC2C";
import { nanoid } from "nanoid";

import useGameStorage from "./Board/game/useGameStorage";

export const LoadLastGameLink = () => {
  const { t } = useTranslation();
  const [c2c] = useC2C();

  const [gameLocalSave] = useGameStorage();

  const loadGame = React.useCallback(
    (game) => {
      game.items = game.items.map((item) => ({ ...item, id: nanoid() }));
      c2c.publish("loadGame", game, true);
    },
    [c2c]
  );

  const loadLocalSavedGame = React.useCallback(() => {
    loadGame({ ...gameLocalSave });
  }, [loadGame, gameLocalSave]);

  return (
    <button
      className="bm-item button"
      style={{ display: "block", width: "100%" }}
      onClick={loadLocalSavedGame}
    >
      {t("Load last game")}
    </button>
  );
};

export default LoadLastGameLink;
