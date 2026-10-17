import React from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import Account from "./Account";
import useAuth from "../hooks/useAuth";
import Modal from "../ui/Modal";

import Brand from "./Brand";
import { FaDiscord } from "react-icons/fa";
import { FiGithub } from "react-icons/fi";

const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "French", flag: "🇫🇷" },
];

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

  & .language-option {
    align-items: center;
    display: flex;
    gap: 0.5em;
    justify-content: space-between;
    min-width: 10em;
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
        {SUPPORTED_LANGUAGES.map(({ code, label, flag }) => (
          <button
            key={code}
            className="button language-option"
            onClick={() => changeLanguage(code)}
            aria-pressed={currentLanguage === code}
          >
            <span>{flag}</span>
            <span>{t(label)}</span>
          </button>
        ))}
      </Modal>
    </>
  );
};

export default HomeNav;
