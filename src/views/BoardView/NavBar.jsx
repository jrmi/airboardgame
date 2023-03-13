import React from "react";

import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useNavigate, useMatch, useParams } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert";
import { useUsers, useBoardConfig } from "react-sync-board";

import UserList from "../../users/UserList";
import Touch from "../../ui/Touch";
import WebConferenceButton from "../../webconf/WebConferenceButton";

import { getBestTranslationFromConfig } from "../../utils/api";

import InfoModal from "./InfoModal";
import LoadGameModal from "./LoadGameModal";
import LoadSessionModal from "./LoadSessionModal";
import ChangeGameModal from "./ChangeGameModal";
import ExportModal from "./ExportModal";
import SaveExportModal from "./SaveExportModal";
import WelcomeModal from "./WelcomeModal";
import LoadVassalModuleGameModal from "./LoadVassalModuleGameModal";

import useSession from "../../hooks/useSession";

const StyledNavBar = styled.div.attrs(() => ({ className: "nav" }))`
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 205;

  background-color: #19202ce0;
  box-shadow: 0px 3px 6px #00000029;

  color: var(--font-color);

  & .nav-center {
    display: relative;
    & h3 {
      position: absolute;
      top: 0;
      margin: 0;
      padding: 0 1em;

      background-color: ${({ edit }) =>
        edit ? "var(--color-primary)" : "transparent"};

      line-height: 5rem;
      letter-spacing: 0px;
      font-size: 24px;
      text-transform: uppercase;
    }
  }

  & .nav-right,
  & .nav-center,
  & .nav-left {
    align-items: center;
  }

  & .nav-left {
    & > div {
      padding-right: 1em;
    }
    padding-left: 40px;
    justify-content: flex-start;
  }

  & .nav-right {
    justify-content: flex-end;
    padding-right: 1em;
    gap: 1em;
  }

  & .spacer {
    flex: 1;
    max-width: 1em;
  }

  @media screen and (max-width: 640px) {
    & .nav-left {
      flex: 1;
      padding-left: 5px;
      & > div {
        padding-right: 2px;
      }
    }

    & .nav-center h3 {
      position: relative;
      padding: 0;

      background-color: transparent;
      box-shadow: none;
      line-height: 1.2em;
      font-size: 1.2em;
      transform: none;
    }

    /* TODO quick but dirty way to do that, need refactoring */
    & .hide-mobile {
      display: none;
    }

    & .spacer {
      flex: 0;
    }

    & {
      flex-direction: row;
    }
    & .save {
      display: none;
    }
    & .info {
      margin: 0;
      padding: 0;
      width: 24px;
      height: 24px;
    }
    & .help {
      margin: 0;
      padding: 0;
      width: 24px;
      height: 24px;
    }
    & h3 {
      font-size: 1.2em;
    }
  }
`;

const NavBar = ({ editMode, title }) => {
  const { t, i18n } = useTranslation();
  const { sessionId: room, isVassalSession } = useSession();
  const [boardConfig] = useBoardConfig();

  const { isSpaceMaster: isMaster } = useUsers();

  const navigate = useNavigate();
  const params = useParams();
  const insideASession = useMatch("/session/:sessionId");
  const insideARoom = useMatch("/room/:roomId/session/:sessionId");

  const [showLoadGameModal, setShowLoadGameModal] = React.useState(
    isMaster && isVassalSession
  );
  const [showSaveGameModal, setShowSaveGameModal] = React.useState(false);
  const [showChangeGameModal, setShowChangeGameModal] = React.useState(false);
  const [showInfoModal, setShowInfoModal] = React.useState(false);
  const [showLink, setShowLink] = React.useState(false);

  const translation = React.useMemo(
    () => getBestTranslationFromConfig(boardConfig, i18n.languages),
    [boardConfig, i18n.languages]
  );

  const handleBack = React.useCallback(() => {
    // If inside session
    if (insideASession) {
      // Go to previous if exists
      // Previous can be home or studio
      // Yes history should be greater than 2 for some reason...
      navigate(-1);
      return;
    }
    // If inside room, go back to that room
    if (insideARoom) {
      navigate(`/room/${params.roomId}`);
      return;
    }
    // Otherwise, go back to home
    navigate("/games");
  }, [insideASession, navigate, insideARoom, params.roomId]);

  const handleBackWithConfirm = React.useCallback(() => {
    confirmAlert({
      title: t("Confirmation"),
      message: t("Do you really want to quit game edition?"),
      buttons: [
        {
          label: t("Yes"),
          onClick: async () => {
            navigate("/studio");
          },
        },
        {
          label: t("No"),
          onClick: () => {},
        },
      ],
    });
  }, [navigate, t]);

  return (
    <>
      <StyledNavBar edit={editMode}>
        <div className="nav-left">
          {!editMode && (
            <>
              <Touch
                onClick={handleBack}
                alt={t("Go back")}
                title={t("Go back")}
                icon={"chevron-left"}
                style={{ display: "inline" }}
              />
              {isMaster && (
                <div className="hide-mobile">
                  <Touch
                    onClick={() => setShowChangeGameModal((prev) => !prev)}
                    alt={t("Change game")}
                    title={t("Change game")}
                    icon="https://icongr.am/material/cards-playing-outline.svg?size=24&color=f9fbfa"
                  />
                  <ChangeGameModal
                    show={showChangeGameModal}
                    setShow={setShowChangeGameModal}
                  />
                </div>
              )}
            </>
          )}
          {editMode && (
            <Touch
              onClick={handleBackWithConfirm}
              alt={t("Go back to studio")}
              title={t("Go back to studio")}
              icon={"chevron-left"}
              style={{ display: "inline" }}
            />
          )}
        </div>

        <div className="nav-center">
          <h3>
            {translation.name ? translation.name : title || "Air Board Game"}
          </h3>
        </div>

        <div className="nav-right">
          {!editMode && (
            <>
              <div className="hide-mobile">
                <UserList />
              </div>
              <div className="hide-mobile">
                <Touch
                  onClick={() => {
                    setShowLink(true);
                  }}
                  icon="add-user"
                  title={t("Invite more player")}
                />
              </div>
              <div className="hide-mobile">
                <WebConferenceButton room={room} />
              </div>
            </>
          )}
          <div className="spacer" />
          {(isMaster || editMode) && !isVassalSession && (
            <div className="hide-mobile">
              <Touch
                onClick={() => setShowLoadGameModal((prev) => !prev)}
                alt={editMode ? t("Load game") : t("Load session")}
                title={editMode ? t("Load game") : t("Load session")}
                icon={"upload-to-cloud"}
              />
            </div>
          )}
          {isMaster && isVassalSession && (
            <div className="hide-mobile">
              <Touch
                onClick={() => setShowLoadGameModal((prev) => !prev)}
                alt={
                  editMode ? t("Load Vassal module") : t("Load Vassal module")
                }
                title={
                  editMode ? t("Load Vassal module") : t("Load Vassale module")
                }
                icon={"upload-to-cloud"}
              />
            </div>
          )}
          <div className="hide-mobile">
            <Touch
              onClick={() => setShowSaveGameModal((prev) => !prev)}
              alt={t("Save")}
              title={editMode ? t("Save game") : t("Save session")}
              icon={editMode ? "save" : "download"}
            />
          </div>
          <div className="spacer" />
          <Touch
            onClick={() => setShowInfoModal((prev) => !prev)}
            alt={t("Help & info")}
            title={t("Help & info")}
            icon={"help"}
          />
        </div>
      </StyledNavBar>
      <InfoModal show={showInfoModal} setShow={setShowInfoModal} />

      {!editMode && (
        <WelcomeModal show={showLink} setShow={setShowLink} welcome={false} />
      )}
      {!editMode && !isVassalSession && (
        <LoadSessionModal
          show={showLoadGameModal}
          setShow={setShowLoadGameModal}
          edit={editMode}
        />
      )}
      {!editMode && isVassalSession && (
        <LoadVassalModuleGameModal
          show={showLoadGameModal}
          setShow={setShowLoadGameModal}
          edit={editMode}
        />
      )}
      {editMode && (
        <LoadGameModal
          show={showLoadGameModal}
          setShow={setShowLoadGameModal}
          edit={editMode}
        />
      )}
      {!editMode && (
        <ExportModal show={showSaveGameModal} setShow={setShowSaveGameModal} />
      )}
      {editMode && (
        <SaveExportModal
          show={showSaveGameModal}
          setShow={setShowSaveGameModal}
        />
      )}
    </>
  );
};

export default NavBar;
