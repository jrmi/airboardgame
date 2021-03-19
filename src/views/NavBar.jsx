import React from "react";

import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import InfoModal from "../views/InfoModal";
import InfoEditModal from "../views/InfoEditModal";
import LoadGameModal from "../views/LoadGameModal";
import LoadSessionModal from "../views/LoadSessionModal";
import ExportModal from "../views/ExportModal";
import SaveExportModal from "../views/SaveExportModal";
import { UserList } from "../components/users";
import { getBestTranslationFromConfig } from "../utils/api";
import Touch from "../ui/Touch";

import useBoardConfig from "../components/useBoardConfig";
import { useC2C } from "../hooks/useC2C";
import Brand from "./Brand";

import { confirmAlert } from "react-confirm-alert";

const StyledNavBar = styled.div.attrs(() => ({ className: "nav" }))`
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 10;

  background-color: #19202ce0;
  box-shadow: 0px 3px 6px #00000029;

  color: var(--font-color);

  & .nav-center {
    display: relative;
    & h3 {
      position: absolute;
      top: 0;
      margin: 0;
      padding: 0 2em;

      background-color: var(--color-blueGrey);
      box-shadow: 0px 3px 6px #00000029;

      line-height: 90px;
      letter-spacing: 0px;
      font-size: 24px;
      text-transform: uppercase;

      transform: perspective(280px) rotateX(-20deg);
    }
  }

  & .nav-right,
  & .nav-center,
  & .nav-left {
    align-items: center;
  }

  & .nav-left {
    & > div {
      flex: 1;
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
    & .nav-center h3 {
      position: relative;
      padding: 0;

      background-color: transparent;
      box-shadow: none;
      line-height: 1.2em;
      font-size: 1.2em;
      transform: none;
    }

    & .nav-right {
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
    & .nav-left {
      flex: 0;
    }
  }
`;

const NavBar = ({ editMode }) => {
  const { t, i18n } = useTranslation();
  const { isMaster } = useC2C();
  const history = useHistory();
  const [showLoadGameModal, setShowLoadGameModal] = React.useState(false);
  const [showSaveGameModal, setShowSaveGameModal] = React.useState(false);
  const [showEditInfoModal, setShowEditInfoModal] = React.useState(false);
  const [showInfoModal, setShowInfoModal] = React.useState(false);

  const [boardConfig] = useBoardConfig();

  const translation = React.useMemo(
    () => getBestTranslationFromConfig(boardConfig, i18n.languages),
    [boardConfig, i18n.languages]
  );

  const handleGoBack = React.useCallback(() => {
    confirmAlert({
      title: t("Confirmation"),
      message: t("Do you really want to quit game edition?"),
      buttons: [
        {
          label: t("Yes"),
          onClick: async () => {
            history.push("/studio");
          },
        },
        {
          label: t("No"),
          onClick: () => {},
        },
      ],
    });
  }, [history, t]);

  return (
    <>
      <StyledNavBar>
        <div className="nav-left">
          {!editMode && <Brand />}
          {editMode && (
            <Touch
              onClick={handleGoBack}
              alt={t("Go back to studio")}
              title={t("Go back to studio")}
              icon={"chevron-left"}
              style={{ display: "inline" }}
            />
          )}
        </div>

        <div className="nav-center">
          <h3>{translation.name ? translation.name : "Air Board Game"}</h3>
        </div>

        <div className="nav-right">
          {!editMode && <UserList />}
          <div className="spacer" />
          {(isMaster || editMode) && (
            <Touch
              onClick={() => setShowLoadGameModal((prev) => !prev)}
              alt={editMode ? t("Load game") : t("Load session")}
              title={editMode ? t("Load game") : t("Load session")}
              icon={"upload-to-cloud"}
            />
          )}
          <Touch
            onClick={() => setShowSaveGameModal((prev) => !prev)}
            alt={t("Save")}
            title={editMode ? t("Save game") : t("Save session")}
            icon={editMode ? "save" : "download"}
          />
          <div className="spacer" />
          {editMode && (
            <Touch
              onClick={() => setShowEditInfoModal((prev) => !prev)}
              alt={t("Edit game info")}
              title={t("Edit game info")}
              icon={"new-message"}
            />
          )}
          <Touch
            onClick={() => setShowInfoModal((prev) => !prev)}
            alt={t("Help & info")}
            title={t("Help & info")}
            icon={"info"}
          />
        </div>
      </StyledNavBar>
      <InfoModal show={showInfoModal} setShow={setShowInfoModal} />
      {editMode && (
        <InfoEditModal
          show={showEditInfoModal}
          setShow={setShowEditInfoModal}
        />
      )}
      {!editMode && (
        <LoadSessionModal
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
