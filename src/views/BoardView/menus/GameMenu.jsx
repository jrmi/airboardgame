import React from "react";
import { useTranslation } from "react-i18next";
import { FiSave, FiUpload } from "react-icons/fi";
import { GiPokerHand } from "react-icons/gi";

import { MenuItem, TopMenu } from "./Menu";

const GameMenu = ({
  activeMenu,
  setActiveMenu,
  editMode,
  isMaster,
  isVassalSession,
  onChangeGame,
  onLoad,
  onSave,
}) => {
  const { t } = useTranslation();

  return (
    <TopMenu
      Icon={GiPokerHand}
      label={t("Game")}
      activeMenu={activeMenu}
      setActiveMenu={setActiveMenu}
    >
      {isMaster && !editMode && (
        <MenuItem onClick={onChangeGame}>
          <GiPokerHand size={16} aria-hidden="true" />
          {t("Change game")}
        </MenuItem>
      )}
      {(isMaster || editMode) && !isVassalSession && (
        <MenuItem onClick={onLoad}>
          <FiUpload size={16} aria-hidden="true" />
          {editMode ? t("Load game") : t("Load session")}
        </MenuItem>
      )}
      {isMaster && isVassalSession && (
        <MenuItem onClick={onLoad}>
          <FiUpload size={16} aria-hidden="true" />
          {t("Load Vassal module")}
        </MenuItem>
      )}
      <MenuItem onClick={onSave}>
        <FiSave size={16} aria-hidden="true" />
        {editMode ? t("Save game") : t("Save session")}
      </MenuItem>
    </TopMenu>
  );
};

export default GameMenu;
