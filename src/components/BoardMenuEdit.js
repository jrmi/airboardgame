import React from "react";
import { slide as Menu } from "react-burger-menu";
import { useTranslation } from "react-i18next";

import { useC2C } from "../hooks/useC2C";

import { updateGame } from "../utils/api";
import { useGame } from "../hooks/useGame";

import DownloadGameLink from "../components/DownloadGameLink";

const styles = {
  bmBurgerButton: {
    display: "none",
    position: "fixed",
    width: "36px",
    height: "30px",
    left: "1em",
    top: "1em",
  },
  bmBurgerBars: {
    background: "#FFFFFF",
  },
  bmBurgerBarsHover: {
    background: "#a90000",
  },
  bmCrossButton: {
    height: "24px",
    width: "24px",
  },
  bmCross: {
    background: "#bdc3c7",
  },
  bmMenuWrap: {
    width: "25%",
    position: "fixed",
    top: "3em",
    left: 0,
    bottom: 0,
    height: "auto",
  },
  bmMenu: {
    background: "#373a47",
    padding: "1em",
    fontSize: "1.15em",
  },
  bmMorphShape: {
    fill: "#373a47",
  },
  bmItemList: {
    color: "#b8b7ad",
    padding: "0.8em",
    position: "static",
    display: "block",
    backgroundColor: "transparent",
    boxShadow: "none",
  },
  bmItem: {
    display: "block",
    width: "100%",
  },
  bmOverlay: {
    background: "rgba(0, 0, 0, 0.3)",
  },
};

const BoardMenuEdit = ({ isOpen, setMenuOpen, setShowLoadGameModal }) => {
  const { t } = useTranslation();
  const [, , isMaster] = useC2C();
  const { gameId, getGame } = useGame();

  const handleStateChange = React.useCallback(
    (state) => {
      setMenuOpen(state.isOpen);
    },
    [setMenuOpen]
  );

  if (!isMaster) {
    return null;
  }

  const handleSave = async () => {
    const currentGame = await getGame();
    if (gameId && gameId.length > 8) {
      await updateGame(gameId, currentGame);
    } else {
      console.log("Game not created. It's not a real one.");
    }
    setMenuOpen(false);
  };

  return (
    <Menu
      isOpen={isOpen}
      styles={styles}
      onStateChange={handleStateChange}
      disableAutoFocus
    >
      <h3>{t("Save")}</h3>
      <button onClick={handleSave}>Save</button>
      <button
        className="button"
        onClick={() => {
          setShowLoadGameModal(true);
          setMenuOpen(false);
        }}
      >
        {t("Import game")}
      </button>
      <DownloadGameLink />
    </Menu>
  );
};

export default BoardMenuEdit;
