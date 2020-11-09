import React from "react";
import { Link } from "react-router-dom";

import styled from "styled-components";

import HelpModal from "../views/HelpModal";
import InfoModal from "../views/InfoModal";
import InfoEditModal from "../views/InfoEditModal";
import LoadSaveModal from "../views/LoadSaveModal";
import { UserList } from "../components/users";
import { getBestTranslationFromConfig } from "../utils/api";

import useBoardConfig from "../components/useBoardConfig";

import logo from "../images/logo.png";
import { useTranslation } from "react-i18next";

const StyledNavBar = styled.div.attrs(() => ({ className: "nav" }))`
  position: fixed;
  top: 0;
  width: 100%;
  background-color: rgba(26, 26, 26, 0.7);
  z-index: 10;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  & .nav-center {
    display: flex;
    align-items: center;
    & h3 {
      margin: 0;
    }
  }
`;

const NavBar = ({ editMode }) => {
  const { t, i18n } = useTranslation();
  const [showLoadGameModal, setShowLoadGameModal] = React.useState(false);
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
          <Link to="/games/" className="brand">
            <img src={logo} alt="Air Board Game" title={t("Go to home")} />
          </Link>
          <button
            className="button clear icon-only"
            onClick={() => setShowLoadGameModal((prev) => !prev)}
          >
            <img
              src="https://icongr.am/feather/save.svg?size=50&color=ffffff"
              alt={t("Save")}
              title={t("Save")}
            />
          </button>
        </div>

        <div className="nav-center">
          <h3>{translation.name ? translation.name : "Air Board Game"}</h3>
          <button
            className="button clear icon-only"
            onClick={() => setShowInfoModal((prev) => !prev)}
          >
            {!editMode && (
              <img
                src="https://icongr.am/feather/info.svg?size=50&color=ffffff"
                alt={t("Info")}
                title={t("Info")}
              />
            )}
            {editMode && (
              <img
                src="https://icongr.am/feather/edit.svg?size=50&color=ffffff"
                alt={t("Configure game")}
                title={t("Configure game")}
              />
            )}
          </button>
        </div>

        <div className="nav-right">
          {!editMode && <UserList />}
          <button
            className="button clear icon-only"
            onClick={() => setShowHelpModal((prev) => !prev)}
          >
            <img
              src="https://icongr.am/feather/help-circle.svg?size=50&color=ffffff"
              alt={t("Help")}
              title={t("Help")}
            />
          </button>
        </div>

        <div className="menu"></div>
      </StyledNavBar>
      <HelpModal show={showHelpModal} setShow={setShowHelpModal} />
      {!editMode && (
        <InfoModal show={showInfoModal} setShow={setShowInfoModal} />
      )}
      {editMode && (
        <InfoEditModal show={showInfoModal} setShow={setShowInfoModal} />
      )}
      <LoadSaveModal
        show={showLoadGameModal}
        setShow={setShowLoadGameModal}
        edit={editMode}
      />
    </>
  );
};

export default NavBar;
