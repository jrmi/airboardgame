import React from "react";
import styled from "styled-components";

import { useTranslation } from "react-i18next";
import { useMatch, useNavigate, useParams } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert";
import { useItems, useUsers } from "react-sync-board";
import {
  FiEye,
  FiHelpCircle,
  FiLink,
  FiMaximize,
  FiMessageSquare,
  FiMic,
  FiPlusCircle,
  FiRotateCcw,
  FiRotateCw,
  FiSave,
  FiSettings,
  FiTarget,
  FiUpload,
  FiUsers,
} from "react-icons/fi";
import { GiPokerHand } from "react-icons/gi";

import { useBoardPosition } from "react-sync-board";

import BoardForm from "./BoardForm";
import SessionForm from "./SessionForm";

import InfoModal from "./InfoModal";
import LoadGameModal from "./LoadGameModal";
import LoadSessionModal from "./LoadSessionModal";
import ChangeGameModal from "./ChangeGameModal";
import ExportModal from "./ExportModal";
import SaveExportModal from "./SaveExportModal";
import WelcomeModal from "./WelcomeModal";
import EditInfoButton from "./EditInfoButton";
import AddItemButton from "./AddItemButton";

import useSession from "../../hooks/useSession";

import target from "../../media/images/target.svg";

import { default as RawNavBar } from "../../ui/NavBar";
import useFullScreen from "../../hooks/useFullScreen";
import UserBar from "./UserBar";
import UserList from "../../users/UserList";

const LoadVassalModuleGameModal = React.lazy(
  () => import("./LoadVassalModuleGameModal.jsx")
);

const MenuRoot = styled.div.attrs({ className: "top-menu" })`
  position: relative;
  height: 100%;

  @media screen and (min-width: 641px) {
    &:hover .top-menu__trigger {
      background: ${({ $dismissed }) =>
        $dismissed ? "transparent" : "rgba(255, 255, 255, 0.1)"};
    }

    &:hover .top-menu__panel {
      display: ${({ $dismissed }) => ($dismissed ? "none" : "block")} !important;
    }
  }
`;

const MenuTrigger = styled.button.attrs({ className: "top-menu__trigger" })`
  display: inline-flex;
  align-items: center;
  gap: 0.45em;
  position: relative;
  height: 100%;
  padding: 0 0.75em;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;

  &:hover,
  &[aria-expanded="true"] {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const MenuBadge = styled.span`
  display: grid;
  min-width: 1.25em;
  height: 1.25em;
  padding: 0 0.2em;
  margin-left: 0.1em;
  place-items: center;
  border-radius: 1em;
  background: var(--color-success);
  color: var(--color-primary-foreground);
  font-size: 0.7em;
  font-weight: 700;
`;

const MenuPanel = styled.div.attrs({ className: "top-menu__panel" })`
  position: absolute;
  top: calc(100% + 1px);
  left: 0;
  min-width: 12em;
  padding: 0.35em;
  background: var(--color-board-panel-raised);
  border: 1px solid var(--color-board-border);
  border-radius: 0 0 6px 6px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.38);
  display: ${({ $open }) => ($open ? "block" : "none")};
`;

const MenuItem = styled.button.attrs(({ $keepMenuOpen }) => ({
  "data-close-mobile-menu": $keepMenuOpen ? undefined : true,
  "data-menu-item": true,
}))`
  display: flex;
  align-items: center;
  gap: 0.65em;
  width: 100%;
  padding: 0.55em 0.75em;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const TopMenu = ({
  Icon,
  label,
  badge,
  activeMenu,
  setActiveMenu,
  children,
}) => {
  const open = activeMenu === label;
  const [dismissed, setDismissed] = React.useState(false);

  return (
    <MenuRoot
      $dismissed={dismissed}
      onMouseEnter={(event) => {
        if (!event.currentTarget.contains(event.target)) return;
        setDismissed(false);
        setActiveMenu(label);
      }}
      onMouseLeave={(event) => {
        if (!event.currentTarget.contains(event.target)) return;
        setDismissed(false);
        setActiveMenu(null);
      }}
      onClickCapture={(event) => {
        if (event.target.closest("[data-menu-item]")) {
          setDismissed(true);
          setActiveMenu(null);
        }
      }}
    >
      <MenuTrigger
        type="button"
        aria-expanded={open}
        onClick={() => setActiveMenu(open ? null : label)}
      >
        {Icon && <Icon size={16} aria-hidden="true" />}
        {label}
        {badge !== undefined && <MenuBadge>{badge}</MenuBadge>}
      </MenuTrigger>
      <MenuPanel $open={open}>{children}</MenuPanel>
    </MenuRoot>
  );
};

const NavBar = ({ editMode, itemLibraries, interaction, setInteraction }) => {
  const { t } = useTranslation();
  const { isVassalSession } = useSession();

  const items = useItems();
  const { rotateBoard, zoomToExtent } = useBoardPosition();

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
  const [showLink, setShowLink] = React.useState(false);
  const [showAddPanel, setShowAddPanel] = React.useState(false);
  const [activeMenu, setActiveMenu] = React.useState(null);

  const closeMenu = React.useCallback(() => setActiveMenu(null), []);

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
        {
          label: t("Yes"),
          onClick: () => navigate("/studio"),
        },
        {
          label: t("No"),
          onClick: () => {},
        },
      ],
    });
  }, [editMode, insideARoom, navigate, params.roomId, t]);

  return (
    <>
      <RawNavBar position="top" fullHeight={false} onClose={handleQuit}>
        <TopMenu
          Icon={GiPokerHand}
          label={t("Game")}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
        >
          {isMaster && !editMode && (
            <MenuItem
              onClick={() => {
                setShowChangeGameModal(true);
                closeMenu();
              }}
            >
              <GiPokerHand size={16} aria-hidden="true" />
              {t("Change game")}
            </MenuItem>
          )}
          {(isMaster || editMode) && !isVassalSession && (
            <MenuItem
              onClick={() => {
                setShowLoadGameModal(true);
                closeMenu();
              }}
            >
              <FiUpload size={16} aria-hidden="true" />
              {editMode ? t("Load game") : t("Load session")}
            </MenuItem>
          )}
          {isMaster && isVassalSession && (
            <MenuItem
              onClick={() => {
                setShowLoadGameModal(true);
                closeMenu();
              }}
            >
              <FiUpload size={16} aria-hidden="true" />
              {t("Load Vassal module")}
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              setShowSaveGameModal(true);
              closeMenu();
            }}
          >
            <FiSave size={16} aria-hidden="true" />
            {editMode ? t("Save game") : t("Save session")}
          </MenuItem>
        </TopMenu>
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
              <MenuItem
                data-close-mobile-menu
                onClick={() => {
                  onClick();
                }}
              >
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
                <MenuItem
                  data-close-mobile-menu
                  onClick={() => {
                    onClick();
                  }}
                >
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
                <MenuItem
                  data-close-mobile-menu
                  onClick={() => {
                    onClick();
                  }}
                >
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
                <MenuItem
                  data-close-mobile-menu
                  onClick={() => {
                    onClick();
                  }}
                >
                  <FiSettings size={16} aria-hidden="true" />
                  {t("Navigation settings")}
                </MenuItem>
              )}
            />
          )}
        </TopMenu>
        <TopMenu
          Icon={FiEye}
          label={t("View")}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
        >
          <MenuItem
            $keepMenuOpen
            onClick={() => {
              rotateBoard((prev) => prev - 90);
              closeMenu();
            }}
          >
            <FiRotateCcw size={16} aria-hidden="true" />
            {t("Rotate board counterclockwise")}
          </MenuItem>
          <MenuItem
            $keepMenuOpen
            onClick={() => {
              rotateBoard((prev) => prev + 90);
              closeMenu();
            }}
          >
            <FiRotateCw size={16} aria-hidden="true" />
            {t("Rotate board clockwise")}
          </MenuItem>
          <MenuItem
            onClick={() => {
              centerOnItems();
              closeMenu();
            }}
          >
            <FiTarget size={16} aria-hidden="true" />
            {t("Center on items")}
          </MenuItem>
          <MenuItem
            onClick={() => {
              toggleFullScreen();
              closeMenu();
            }}
          >
            <FiMaximize size={16} aria-hidden="true" />
            {isFullScreen ? t("Exit fullscreen") : t("Fullscreen")}
          </MenuItem>
        </TopMenu>
        {!editMode && (
          <TopMenu
            Icon={FiUsers}
            label={t("Users")}
            badge={localUsers.length}
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
          >
            <div data-close-mobile-menu>
              <UserList showNames />
            </div>
            <UserBar
              inline
              renderMenuItems={({
                openInvitation,
                renderChat,
                renderConference,
              }) => (
                <>
                  <MenuItem
                    data-close-mobile-menu
                    onClick={() => {
                      openInvitation();
                    }}
                  >
                    <FiLink size={16} aria-hidden="true" />
                    {t("Invite more player")}
                  </MenuItem>
                  {renderChat((onClick) => (
                    <MenuItem onClick={onClick}>
                      <FiMessageSquare size={16} aria-hidden="true" />
                      {t("Chat")}
                    </MenuItem>
                  ))}
                  {renderConference((onClick) => (
                    <MenuItem onClick={onClick}>
                      <FiMic size={16} aria-hidden="true" />
                      {t("Web conference")}
                    </MenuItem>
                  ))}
                </>
              )}
            />
          </TopMenu>
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
      {editMode && (
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
      )}
      {!editMode && (
        <>
          <WelcomeModal show={showLink} setShow={setShowLink} welcome={false} />
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
