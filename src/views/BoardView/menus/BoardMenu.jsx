import React from "react";
import { useTranslation } from "react-i18next";
import { FiMousePointer, FiPlusCircle, FiSettings } from "react-icons/fi";

import BoardForm from "../BoardForm";
import SessionForm from "../SessionForm";
import AddItemButton from "../AddItemButton";
import EditInfoButton from "../EditInfoButton";
import InteractionSettingsButton from "../InteractionSettingsButton";
import { MenuItem, TopMenu } from "./Menu";

const BoardMenu = ({
  activeMenu,
  setActiveMenu,
  editMode,
  isMaster,
  itemLibraries,
  interaction,
  setInteraction,
  showAddPanel,
  setShowAddPanel,
}) => {
  const { t } = useTranslation();

  return (
    <TopMenu
      Icon={FiSettings}
      label={t("Board")}
      activeMenu={activeMenu}
      setActiveMenu={setActiveMenu}
    >
      <AddItemButton
        itemLibraries={itemLibraries}
        setShowAddPanel={setShowAddPanel}
        showAddPanel={showAddPanel}
        renderTrigger={(onClick) => (
          <MenuItem onClick={onClick}>
            <FiPlusCircle size={16} aria-hidden="true" />
            {t("Add item")}
          </MenuItem>
        )}
      />
      <InteractionSettingsButton
        interaction={interaction}
        setInteraction={setInteraction}
        renderTrigger={(onClick) => (
          <MenuItem onClick={onClick}>
            <FiMousePointer size={16} aria-hidden="true" />
            {t("Player interaction")}
          </MenuItem>
        )}
      />
      {editMode && (
        <EditInfoButton
          BoardFormComponent={BoardForm}
          renderTrigger={(onClick) => (
            <MenuItem onClick={onClick}>
              <FiSettings size={16} aria-hidden="true" />
              {t("Edit game info")}
            </MenuItem>
          )}
        />
      )}
      {!editMode && isMaster && (
        <EditInfoButton
          BoardFormComponent={SessionForm}
          renderTrigger={(onClick) => (
            <MenuItem onClick={onClick}>
              <FiSettings size={16} aria-hidden="true" />
              {t("Edit game info")}
            </MenuItem>
          )}
        />
      )}
    </TopMenu>
  );
};

export default BoardMenu;
