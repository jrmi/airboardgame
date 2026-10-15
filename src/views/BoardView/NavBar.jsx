import React from "react";

import { useTranslation } from "react-i18next";
import { useMatch, useNavigate, useParams } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert";
import { useBoardPosition, useItems, useUsers } from "react-sync-board";
import { FiHelpCircle } from "react-icons/fi";

import InfoModal from "./InfoModal";
import LoadGameModal from "./LoadGameModal";
import LoadSessionModal from "./LoadSessionModal";
import ChangeGameModal from "./ChangeGameModal";
import ExportModal from "./ExportModal";
import SaveExportModal from "./SaveExportModal";
import GameMenu from "./menus/GameMenu";
import BoardMenu from "./menus/BoardMenu";
import ViewMenu from "./menus/ViewMenu";
import UsersMenu from "./menus/UsersMenu";
import { MenuTrigger } from "./menus/Menu";

import useSession from "../../hooks/useSession";
import target from "../../media/images/target.svg";
import { default as RawNavBar } from "../../ui/NavBar";
import useFullScreen from "../../hooks/useFullScreen";

const LoadVassalModuleGameModal = React.lazy(
  () => import("./LoadVassalModuleGameModal.jsx")
);

const NavBar = ({ editMode, itemLibraries, interaction, setInteraction }) => {
  const { t } = useTranslation();
  const { isVassalSession } = useSession();
  const items = useItems();
  const { rotateBoard, zoomToExtent } = useBoardPosition();
  const { toggleFullScreen, active: isFullScreen } = useFullScreen();
  const { isSpaceMaster: isMaster, localUsers } = useUsers();
  const navigate = useNavigate();
  const params = useParams();
  const insideARoom = useMatch("/room/:roomId/session/:sessionId");

  const [showLoadGameModal, setShowLoadGameModal] = React.useState(
    isMaster && isVassalSession
  );
  const [showSaveGameModal, setShowSaveGameModal] = React.useState(false);
  const [showChangeGameModal, setShowChangeGameModal] = React.useState(false);
  const [showInfoModal, setShowInfoModal] = React.useState(false);
  const [showAddPanel, setShowAddPanel] = React.useState(false);
  const [activeMenu, setActiveMenu] = React.useState(null);

  const closeMenu = React.useCallback(() => setActiveMenu(null), []);

  const centerOnItems = React.useCallback(() => {
    const renderedItems = new Map(
      Array.from(document.querySelectorAll("[data-id]")).map((element) => [
        element.dataset.id,
        element,
      ])
    );
    const bounds = items.reduce(
      (current, item) => {
        const element = renderedItems.get(item.id);
        if (!element) return current;

        return {
          left: Math.min(current.left, item.x),
          top: Math.min(current.top, item.y),
          right: Math.max(current.right, item.x + element.offsetWidth),
          bottom: Math.max(current.bottom, item.y + element.offsetHeight),
        };
      },
      { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity }
    );

    if (!Number.isFinite(bounds.left)) return;

    const x = (bounds.left + bounds.right) / 2;
    const y = (bounds.top + bounds.bottom) / 2;
    const radius = Math.max(Math.hypot(x - bounds.left, y - bounds.top), 1000);

    zoomToExtent({ x, y, radius });
  }, [items, zoomToExtent]);

  const handleQuit = React.useCallback(() => {
    if (!editMode) {
      if (insideARoom) {
        navigate(`/room/${params.roomId}`);
        return;
      }
      navigate("/games");
      return;
    }

    confirmAlert({
      title: t("Confirmation"),
      message: t("Do you really want to quit game edition?"),
      buttons: [
        { label: t("Yes"), onClick: () => navigate("/studio") },
        { label: t("No"), onClick: () => {} },
      ],
    });
  }, [editMode, insideARoom, navigate, params.roomId, t]);

  return (
    <>
      <RawNavBar position="top" fullHeight={false} onClose={handleQuit}>
        <GameMenu
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          editMode={editMode}
          isMaster={isMaster}
          isVassalSession={isVassalSession}
          onChangeGame={() => {
            setShowChangeGameModal(true);
            closeMenu();
          }}
          onLoad={() => {
            setShowLoadGameModal(true);
            closeMenu();
          }}
          onSave={() => {
            setShowSaveGameModal(true);
            closeMenu();
          }}
        />
        <BoardMenu
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          editMode={editMode}
          isMaster={isMaster}
          itemLibraries={itemLibraries}
          interaction={interaction}
          setInteraction={setInteraction}
          showAddPanel={showAddPanel}
          setShowAddPanel={setShowAddPanel}
        />
        <ViewMenu
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          isFullScreen={isFullScreen}
          onRotate={(angle) => {
            rotateBoard((current) => current + angle);
            closeMenu();
          }}
          onCenter={() => {
            centerOnItems();
            closeMenu();
          }}
          onToggleFullScreen={() => {
            toggleFullScreen();
            closeMenu();
          }}
        />
        {!editMode && (
          <UsersMenu
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            users={localUsers}
          />
        )}
        <div className="spacer" />
        <div className="top-menu__help">
          <MenuTrigger
            type="button"
            data-close-mobile-menu
            onClick={() => setShowInfoModal(true)}
          >
            <FiHelpCircle size={16} aria-hidden="true" />
            {t("Help & info")}
          </MenuTrigger>
        </div>
      </RawNavBar>
      <ChangeGameModal
        show={showChangeGameModal}
        setShow={setShowChangeGameModal}
      />
      {showAddPanel && (
        <img
          style={{
            position: "absolute",
            width: "60px",
            height: "60px",
            left: "calc(50% - 30px)",
            top: "calc(50% - 30px)",
            pointerEvents: "none",
            opacity: 0.3,
          }}
          src={target}
        />
      )}
      <InfoModal show={showInfoModal} setShow={setShowInfoModal} />
      {editMode ? (
        <>
          <LoadGameModal
            show={showLoadGameModal}
            setShow={setShowLoadGameModal}
            edit={editMode}
          />
          <SaveExportModal
            show={showSaveGameModal}
            setShow={setShowSaveGameModal}
          />
        </>
      ) : (
        <>
          <ExportModal
            show={showSaveGameModal}
            setShow={setShowSaveGameModal}
          />
          {isVassalSession ? (
            <LoadVassalModuleGameModal
              show={showLoadGameModal}
              setShow={setShowLoadGameModal}
              edit={editMode}
            />
          ) : (
            <LoadSessionModal
              show={showLoadGameModal}
              setShow={setShowLoadGameModal}
              edit={editMode}
            />
          )}
        </>
      )}
    </>
  );
};

export default NavBar;
