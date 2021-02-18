import React from "react";

import styled from "styled-components";

import HelpModal from "../views/HelpModal";
import InfoModal from "../views/InfoModal";
import InfoEditModal from "../views/InfoEditModal";
import LoadModal from "../views/LoadModal";
import SaveModal from "../views/SaveModal";
import { UserList } from "../components/users";
import { getBestTranslationFromConfig } from "../utils/api";
import Touch from "../ui/Touch";

import useBoardConfig from "../components/useBoardConfig";

import { useTranslation } from "react-i18next";

import Brand from "./Brand";

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
  }

  & .nav-right {
    justify-content: flex-end;
    padding-right: 5px;
    gap: 1em;
  }

  & .spacer {
    flex: 1;
    max-width: 1em;
  }

  @media screen and (max-width: 640px) {
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
  const [showLoadGameModal, setShowLoadGameModal] = React.useState(false);
  const [showSaveGameModal, setShowSaveGameModal] = React.useState(false);
  const [showHelpModal, setShowHelpModal] = React.useState(false);
  const [showInfoModal, setShowInfoModal] = React.useState(false);

  const [boardConfig] = useBoardConfig();

  const translation = React.useMemo(
    () => getBestTranslationFromConfig(boardConfig, i18n.languages),
    [boardConfig, i18n.languages]
  );

  return (
    <>
      <StyledNavBar>
        <div className="nav-left">
          <Brand />
        </div>

        <div className="nav-center">
          <h3>{translation.name ? translation.name : "Air Board Game"}</h3>
        </div>

        <div className="nav-right">
          {!editMode && <UserList />}
          <div className="spacer" />
          <Touch
            onClick={() => setShowLoadGameModal((prev) => !prev)}
            alt={t("Load")}
            title={t("Load game")}
            icon={"upload-to-cloud"}
          />
          <Touch
            onClick={() => setShowSaveGameModal((prev) => !prev)}
            alt={t("Save")}
            title={t("Save session")}
            icon={"download"}
          />
          <div className="spacer" />
          <Touch
            onClick={() => setShowInfoModal((prev) => !prev)}
            alt={t("Info")}
            title={t("Info")}
            icon={editMode ? "tools" : "info"}
          />
          <Touch
            onClick={() => setShowHelpModal((prev) => !prev)}
            alt={t("Help")}
            title={t("Help")}
            icon={"help"}
          />
        </div>
      </StyledNavBar>
      <HelpModal show={showHelpModal} setShow={setShowHelpModal} />
      {!editMode && (
        <InfoModal show={showInfoModal} setShow={setShowInfoModal} />
      )}
      {editMode && (
        <InfoEditModal show={showInfoModal} setShow={setShowInfoModal} />
      )}
      <LoadModal
        show={showLoadGameModal}
        setShow={setShowLoadGameModal}
        edit={editMode}
      />
      <SaveModal
        show={showSaveGameModal}
        setShow={setShowSaveGameModal}
        edit={editMode}
      />
    </>
  );
};

export default NavBar;
