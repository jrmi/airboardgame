import React from "react";
import { slide as Menu } from "react-burger-menu";
import { useTranslation } from "react-i18next";

import { useC2C } from "../hooks/useC2C";

import LoadLastGameLink from "../components/LoadLastGameLink";
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

const BoardMenu = ({ setShowLoadGameModal, isOpen, setMenuOpen }) => {
  const { t } = useTranslation();
  const [, , isMaster] = useC2C();

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
    <>
      <Menu
        isOpen={isOpen}
        styles={styles}
        onStateChange={handleStateChange}
        disableAutoFocus
      >
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
    </>
  );
};

export default BoardMenu;
