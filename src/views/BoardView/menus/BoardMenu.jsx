import React from "react";
import { useTranslation } from "react-i18next";
import { FiPlusCircle, FiSettings } from "react-icons/fi";

import BoardForm from "../BoardForm";
import SessionForm from "../SessionForm";
import AddItemButton from "../AddItemButton";
import EditInfoButton from "../EditInfoButton";
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
      {editMode && (
        <EditInfoButton
          BoardFormComponent={BoardForm}
          interaction={interaction}
          setInteraction={setInteraction}
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
          interaction={interaction}
          setInteraction={setInteraction}
          renderTrigger={(onClick) => (
            <MenuItem onClick={onClick}>
              <FiSettings size={16} aria-hidden="true" />
              {t("Edit game info")}
            </MenuItem>
          )}
        />
      )}
      {!editMode && !isMaster && (
        <EditInfoButton
          interaction={interaction}
          setInteraction={setInteraction}
          title="Navigation settings"
          renderTrigger={(onClick) => (
            <MenuItem onClick={onClick}>
              <FiSettings size={16} aria-hidden="true" />
              {t("Navigation settings")}
            </MenuItem>
          )}
        />
      )}
    </TopMenu>
  );
};

export default BoardMenu;
