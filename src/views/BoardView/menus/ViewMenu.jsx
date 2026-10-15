import React from "react";
import { useTranslation } from "react-i18next";
import {
  FiEye,
  FiMaximize,
  FiRotateCcw,
  FiRotateCw,
  FiTarget,
} from "react-icons/fi";

import { MenuItem, TopMenu } from "./Menu";

const ViewMenu = ({
  activeMenu,
  setActiveMenu,
  isFullScreen,
  onRotate,
  onCenter,
  onToggleFullScreen,
}) => {
  const { t } = useTranslation();

  return (
    <TopMenu
      Icon={FiEye}
      label={t("View")}
      activeMenu={activeMenu}
      setActiveMenu={setActiveMenu}
    >
      <MenuItem $keepMenuOpen onClick={() => onRotate(-90)}>
        <FiRotateCcw size={16} aria-hidden="true" />
        {t("Rotate board counterclockwise")}
      </MenuItem>
      <MenuItem $keepMenuOpen onClick={() => onRotate(90)}>
        <FiRotateCw size={16} aria-hidden="true" />
        {t("Rotate board clockwise")}
      </MenuItem>
      <MenuItem onClick={onCenter}>
        <FiTarget size={16} aria-hidden="true" />
        {t("Center on items")}
      </MenuItem>
      <MenuItem onClick={onToggleFullScreen}>
        <FiMaximize size={16} aria-hidden="true" />
        {isFullScreen ? t("Exit fullscreen") : t("Fullscreen")}
      </MenuItem>
    </TopMenu>
  );
};

export default ViewMenu;
