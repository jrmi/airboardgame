import React from "react";
import { slide as Menu } from "react-burger-menu";
import { useTranslation } from "react-i18next";

import { useC2C } from "../hooks/useC2C";
import { nanoid } from "nanoid";

import testGame from "../games/testGame";
import perfGame from "../games/perfGame";

import LoadLastGameLink from "../components/LoadLastGameLink";
import DownloadGameLink from "../components/DownloadGameLink";

import { GAMELIST_URL, IS_PRODUCTION } from "../utils/settings";

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

const loadGameList = async () => {
  const result = await fetch(GAMELIST_URL);
  return await result.json();
};

const fetchGame = async (url) => {
  const result = await fetch(url);
  return await result.json();
};

const BoardMenu = ({ setShowLoadGameModal, isOpen, setMenuOpen, edit }) => {
  const { t } = useTranslation();
  const [c2c, , isMaster] = useC2C();
  const [gameList, setGameList] = React.useState([]);

  React.useEffect(() => {
    loadGameList().then((content) => {
      setGameList(content);
    });
  }, []);

  const loadGame = React.useCallback(
    (game) => {
      game.items = game.items.map((item) => ({ ...item, id: nanoid() }));
      c2c.publish("loadGame", game, true);
      setMenuOpen(false);
    },
    [c2c, setMenuOpen]
  );

  const loadGameUrl = React.useCallback(
    (url) => {
      fetchGame(url).then((content) => {
        loadGame(content);
      });
    },
    [loadGame]
  );

  const newGame = React.useCallback(() => {
    loadGame({
      items: [],
      availableItems: [],
      board: { size: 1000, scale: 0.5 },
    });
  }, [loadGame]);

  const loadTestGame = React.useCallback(() => {
    loadGame(testGame);
  }, [loadGame]);

  const loadPerfGame = React.useCallback(() => {
    loadGame(perfGame);
  }, [loadGame]);

  const handleStateChange = React.useCallback(
    (state) => {
      setMenuOpen(state.isOpen);
    },
    [setMenuOpen]
  );

  if (!isMaster) {
    return null;
  }

  return (
    <Menu
      isOpen={isOpen}
      styles={styles}
      onStateChange={handleStateChange}
      disableAutoFocus
    >
      <h3>{t("Games")}</h3>
      {edit && (
        <button className="button" onClick={newGame}>
          {t("New Game")}
        </button>
      )}
      {!IS_PRODUCTION && (
        <button className="button" onClick={loadTestGame}>
          {t("Test Game")}
        </button>
      )}
      {!IS_PRODUCTION && (
        <button className="button" onClick={loadPerfGame}>
          {t("Perf Game")}
        </button>
      )}
      {gameList.map(({ name, url }) => (
        <button
          className="button"
          key={name}
          onClick={() => {
            loadGameUrl(url);
          }}
        >
          {name}
        </button>
      ))}
      <h3>{t("Save")}</h3>
      <LoadLastGameLink />
      <button
        className="button"
        onClick={() => {
          setShowLoadGameModal(true);
          setMenuOpen(false);
        }}
      >
        {t("Load game")}
      </button>

      <DownloadGameLink />
    </Menu>
  );
};

export default BoardMenu;
