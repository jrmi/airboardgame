import React from "react";
import { Link } from "react-router-dom";

import { useTranslation } from "react-i18next";

import styled from "styled-components";

import HelpModal from "../views/HelpModal";
import InfoModal from "../views/InfoModal";
import LoadSaveModal from "../views/LoadSaveModal";

import logo from "../images/logo.png";

const StyledNavBar = styled.div.attrs(() => ({ className: "nav" }))`
  position: fixed;
  top: 0;
  width: 100%;
  background-color: var(--bg-secondary-color);
  z-index: 10;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
`;

const NavBar = () => {
  const { t } = useTranslation();

  const [showLoadGameModal, setShowLoadGameModal] = React.useState(false);
  const [showHelpModal, setShowHelpModal] = React.useState(false);
  const [showInfoModal, setShowInfoModal] = React.useState(false);

  return (
    <>
      <StyledNavBar>
        <div className="nav-left">
          <Link to="/games/" className="brand">
            <img src={logo} />
          </Link>
          <a
            className="button clear icon-only"
            onClick={() => setShowLoadGameModal((prev) => !prev)}
          >
            <img src="https://icongr.am/feather/save.svg?size=50&color=ffffff" />
          </a>
        </div>

        <div className="nav-center">
          <h3>Air Board Game</h3>
          <a
            className="button clear icon-only"
            onClick={() => setShowInfoModal((prev) => !prev)}
          >
            <img src="https://icongr.am/feather/info.svg?size=50&color=ffffff" />
          </a>
        </div>

        <div className="nav-right">
          <a
            className="button clear icon-only"
            onClick={() => setShowHelpModal((prev) => !prev)}
          >
            <img src="https://icongr.am/feather/help-circle.svg?size=50&color=ffffff" />
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
