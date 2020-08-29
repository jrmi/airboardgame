import React from "react";

import { useTranslation } from "react-i18next";

import { useC2C } from "../hooks/useC2C";

const NavBar = ({
  setMenuOpen,
  setShowHelpModal,
  setShowInfoModal,
  setEditMode,
  edit,
}) => {
  const { t } = useTranslation();

  const [, , isMaster] = useC2C();
  return (
    <nav style={{ backgroundColor: "#FFFFFF40" }}>
      <span className="brand">
        <span>AirBoard</span>
      </span>

      {isMaster && (
        <button
          className="pseudo button"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {t("Menu")}
        </button>
      )}

      <div className="menu">
        <button className="pseudo" onClick={() => setEditMode((prev) => !prev)}>
          {!edit ? t("Edit mode") : t("Play")}
        </button>
        <button onClick={() => setShowInfoModal((prev) => !prev)}>
          {t("Info")}
        </button>
        <button onClick={() => setShowHelpModal((prev) => !prev)}>
          {t("Help")}
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
