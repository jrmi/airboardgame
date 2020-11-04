import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import CookieConsent from "react-cookie-consent";

import { getGames } from "../utils/api";
import Account from "../components/Account";
import useAuth from "../hooks/useAuth";

import "react-confirm-alert/src/react-confirm-alert.css";
import logo from "../images/logo-mono.png";
import header from "../images/header.jpg";
import useLocalStorage from "../hooks/useLocalStorage";

import AboutModal from "./AboutModal";

const Header = styled.div`
  height: 15em;
  padding-top: 1em;
  margin-bottom: 2em;
  background-color: var(--bg-secondary-color);
  background-image: url(${header});
  position: relative;
  & .baseline {
    font-family: "Merriweather Sans", sans-serif;
    text-align: center;
    position: absolute;
    bottom: 0px;
    background-color: #00000099;
    width: 100%;
    margin: 0;
  }
  & .login {
    float: right;
    margin-right: 0.5em;
  }
  & .login button {
    background-color: var(--color-primary);
  }
  & .new-game {
    position: absolute;
    right: 0.5em;
    top: 4em;
    background-color: var(--color-secondary);
  }
`;

const Brand = styled.div`
  background-color: var(--color-secondary);
  display: flex;
  width: 550px;
  align-items: center;
  padding: 0 1em;
  & h1 {
    font-size: 4em;
    margin: 0;
    padding: 0;
    line-height: 75px;
    margin-left: 0em;
    letter-spacing: -4px;
    font-weight: bold;
    padding-left: 0.2em;
  }
  & img {
    height: 55px;
    margin-top: 8px;
  }
`;

const GameView = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  & > footer {
    margin-top: 1em;
    padding: 0.5em 0;
    text-align: center;
    background-color: #00000099;
  }
`;

const GameList = styled.ul`
  width: 960px;
  list-style: none;
  margin: 0;
  margin: 0 auto;
  padding: 0 2em;
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
`;

const Game = styled.li`
  width: 100%;
  background-color: var(--bg-secondary-color);
  position: relative;
  min-width: 250px;
  max-width: 440px;
  height: 150px;
  padding: 0.5em;
  margin: 0.3em;
  flex: 1 1 0%;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
  width: & .game-name {
    margin: 0 1em;
  }

  & .button.play {
    margin: 0 2px;
    background-color: var(--color-secondary);
  }

  & .play {
    position: absolute;
    bottom: 0.5em;
    right: 0.5em;
  }

  & .extra-actions {
    position: absolute;
    top: 0.5em;
    right: 0.5em;
    display: none;
  }

  &:hover .extra-actions {
    display: block;
  }
`;

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const GameListView = () => {
  const { t } = useTranslation();

  const [isBeta, setIsBeta] = useLocalStorage("isBeta", false);

  if (isBeta) {
    console.log("Beta activated");
  }

  const [cookieConsent, setCookieConsent] = useLocalStorage(
    "cookieConsent",
    false
  );
  const [showAboutModal, setShowAboutModal] = React.useState(false);

  let query = useQuery();

  const [gameList, setGameList] = React.useState([]);
  const { isAuthenticated, userId } = useAuth();

  React.useEffect(() => {
    getGames().then((content) => {
      setGameList(content);
    });
  }, [isAuthenticated]);

  const forceBeta = query.get("beta") === "true";

  React.useEffect(() => {
    if (forceBeta) {
      setIsBeta(true);
    }
  }, [forceBeta, setIsBeta]);

  return (
    <>
      <GameView>
        <Header>
          {isAuthenticated && (
            <Link to={`/game/`} className="button new-game">
              {t("Create new game")}
            </Link>
          )}
          <Account className="login" disabled={!cookieConsent} />
          <Brand className="brand">
            <a href="/">
              <img src={logo} alt="logo" />
            </a>
            <h1>Air Board Game</h1>
          </Brand>
          <h2 className="baseline">
            {t("Play your favorite games online with your friends")}
          </h2>
        </Header>
        <GameList>
          {gameList
            .filter(
              ({ published, owner }) =>
                published || (userId && (!owner || owner === userId))
            )
            .map(({ name, id, owner, published }) => (
              <Game key={id}>
                <h2 className="game-name">
                  {name} {!published && "(Private)"}
                </h2>
                <Link to={`/game/${id}/session/`} className="button play">
                  {t("Play")}
                </Link>
                {userId && (userId === owner || !owner) && (
                  <div className="extra-actions">
                    <Link
                      to={`/game/${id}/edit`}
                      className="button edit icon-only"
                    >
                      <img
                        src="https://icongr.am/feather/edit.svg?size=16&color=ffffff"
                        alt={t("Edit")}
                      />
                    </Link>
                  </div>
                )}
              </Game>
            ))}
        </GameList>
        <footer>
          <button
            className="button clear"
            onClick={() => setShowAboutModal(true)}
          >
            {t("About")}
          </button>
        </footer>
      </GameView>
      <AboutModal show={showAboutModal} setShow={setShowAboutModal} />
      <CookieConsent
        location="bottom"
        buttonText={t("Got it!")}
        enableDeclineButton
        declineButtonText={t("Refuse")}
        cookieName="cookieConsent"
        onAccept={() => setCookieConsent(true)}
        containerClasses="cookie"
        expires={150}
        buttonStyle={{
          color: "var(--font-color)",
          backgroundColor: "var(--color-secondary)",
        }}
        style={{
          backgroundColor: "#000000CE",
          boxShadow:
            "rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px",
        }}
      >
        {t("This site use a cookie only to know if your are authenticated.")}
      </CookieConsent>
    </>
  );
};

export default GameListView;
