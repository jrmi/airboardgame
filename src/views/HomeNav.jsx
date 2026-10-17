import React from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import Account from "./Account";
import useAuth from "../hooks/useAuth";
import Modal from "../ui/Modal";
import { SUPPORTED_LANGUAGES } from "../i18n/languages";

import Brand from "./Brand";
import { FaDiscord } from "react-icons/fa";
import { FiGithub } from "react-icons/fi";

const Nav = styled.nav`
  background-color: var(--bg-color);
  position: relative;
  padding: 0 5%;
  display: flex;
  align-items: center;

  & button,
  & .button {
    background: none;
    text-transform: uppercase;
    font-weight: 300;
    font-size: 1.3em;
    border-radius: 0;
    color: var(--font-color2);
    margin: 0 0.5em;
    letter-spacing: -1px;
    padding: 0;
  }

  & button:hover,
  & .button:hover,
  & .button.active {
    color: var(--font-color);
    border-bottom: 1px solid var(--color-primary);
  }

  & .login,
  & .icon.button,
  & .language-switch {
    align-items: center;
    display: inline-flex;
    line-height: 1;
  }

  & .login button {
    line-height: 1;
  }

  & .language-switch {
    background: none;
    border: 0;
    color: var(--font-color);
    cursor: pointer;
    flex: 0 0 auto;
    font-size: 1.25em;
    margin-left: auto;
    padding: 0.1em 0.25em;
  }

  @media screen and (max-width: 640px) {
    & .button,
    & button {
      display: none;
    }

    & .language-switch {
      display: block;
    }
  }
`;

const LanguageList = styled.div`
  display: grid;
  gap: 0.5em;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  @media screen and (max-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const LanguageOption = styled.button`
  align-items: center;
  background: transparent !important;
  border: 1px solid var(--color-border-subtle);
  border-radius: 4px;
  color: var(--font-color) !important;
  display: flex;
  gap: 0.5em;
  justify-content: flex-start;
  margin: 0;
  min-width: 0;
  padding: 0.65em 0.75em;
  text-align: left;
  text-transform: none;

  &:hover,
  &[aria-pressed="true"] {
    background: var(--color-midGrey) !important;
    border-color: var(--color-primary);
    filter: none;
    opacity: 1;
  }
`;

const HomeNav = () => {
  const { t, i18n } = useTranslation();

  const { isAuthenticated } = useAuth();
  const currentLanguage = i18n.resolvedLanguage?.split("-")[0] || "en";
  const currentLanguageOption =
    SUPPORTED_LANGUAGES.find(({ code }) => code === currentLanguage) ||
    SUPPORTED_LANGUAGES[0];
  const [showLanguageModal, setShowLanguageModal] = React.useState(false);

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    setShowLanguageModal(false);
  };

  return (
    <>
      <Nav>
        <Brand />
        {isAuthenticated && (
          <>
            <NavLink to={"/games/"} className="button">
              {t("All games")}
            </NavLink>
            <NavLink to={"/studio/"} className="button">
              {t("Game studio")}
            </NavLink>
          </>
        )}
        <Account className="login" />
        <button
          className="language-switch"
          onClick={() => setShowLanguageModal(true)}
          aria-label={t("Language")}
          title={t("Language")}
        >
          {currentLanguageOption.flag}
        </button>
        <a
          className="icon button"
          href="https://github.com/jrmi/airboardgame"
          target="_blank"
          rel="noreferrer"
        >
          <FiGithub
            alt={t("Github")}
            title={t("Github")}
            color="#CCCCCC"
            size="16"
          />
        </a>
        <a
          className="icon button"
          href="https://discord.gg/EsZGJ5h6UA"
          target="_blank"
          rel="noreferrer"
        >
          <FaDiscord
            alt={t("Discord")}
            title={t("Discord")}
            color="#CCCCCC"
            size="16"
          />
        </a>
      </Nav>
      <Modal
        title={t("Language")}
        show={showLanguageModal}
        setShow={setShowLanguageModal}
      >
        <LanguageList>
          {SUPPORTED_LANGUAGES.map(({ code, label, flag }) => (
            <LanguageOption
              key={code}
              onClick={() => changeLanguage(code)}
              aria-pressed={currentLanguage === code}
            >
              <span>{flag}</span>
              <span>{t(label)}</span>
            </LanguageOption>
          ))}
        </LanguageList>
      </Modal>
    </>
  );
};

export default HomeNav;
