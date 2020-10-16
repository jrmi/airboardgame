import React from "react";
import { Link } from "react-router-dom";

import { useTranslation } from "react-i18next";

import { useC2C } from "../hooks/useC2C";

import styled from "styled-components";

import HelpModal from "../views/HelpModal";
import InfoModal from "../views/InfoModal";
import LoadSaveModal from "../views/LoadSaveModal";

const StyledNavBar = styled.div.attrs(() => ({ className: "nav" }))``;

const NavBar = ({}) => {
  const { t } = useTranslation();

  const [showLoadGameModal, setShowLoadGameModal] = React.useState(false);
  const [showHelpModal, setShowHelpModal] = React.useState(false);
  const [showInfoModal, setShowInfoModal] = React.useState(false);

  return (
    <>
      <StyledNavBar>
        <div className="nav-left">
          <Link to="/games/" className="brand">
            <span>{t("Home")}</span>
          </Link>
          <a
            className="button outline"
            onClick={() => setShowLoadGameModal((prev) => !prev)}
          >
            {t("Load/Save")}
          </a>
        </div>

        <div className="nav-center">
          <h3>Air Board Game</h3>
          <a
            className="button outline"
            onClick={() => setShowInfoModal((prev) => !prev)}
          >
            {t("Info")}
          </a>
        </div>

        <div className="nav-right">
          <a
            className="button outline"
            onClick={() => setShowHelpModal((prev) => !prev)}
          >
            {t("Help")}
          </a>
        </div>

        <div className="menu"></div>
      </StyledNavBar>
      <HelpModal show={showHelpModal} setShow={setShowHelpModal} />
      <InfoModal show={showInfoModal} setShow={setShowInfoModal} />
      <LoadSaveModal show={showLoadGameModal} setShow={setShowLoadGameModal} />
    </>
  );
};

export default NavBar;
