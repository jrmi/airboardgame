import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import styled from "styled-components";
import CookieConsent from "react-cookie-consent";

import { getGames } from "../utils/api";
import Account from "../components/Account";
import useAuth from "../hooks/useAuth";

import "react-confirm-alert/src/react-confirm-alert.css";
import logo from "../images/logo-mono.png";
import header from "../images/header.jpg";
import useLocalStorage from "../hooks/useLocalStorage";
import GameListItem from "./GameListItem";

import AboutModal from "./AboutModal";

const GameView = styled.div`
  min-height: 100vh;
  flex-direction: column;
  & > footer {
    width: 100%;
    grid-column: 1 / 4;
    margin-top: 1em;
    padding: 0.5em 0;
    text-align: center;
    background-color: #00000099;
  }
`;

const Brand = styled.div`
  position: relative;
  display: inline-block;
  margin-bottom: 12vh;
  & h1 {
    font-weight: 700;
    font-size: 32px;
    & a {
      color: var(--font-color);
    }
  }
  & .beta {
    position: absolute;
    top: 5px;
    right: -40px;
    text-transform: uppercase;
    font-weight: 300;
  }

  @media screen and (max-width: 640px) {
    & {
    }
    & h1 {
    }
  }
`;

const Header = styled.div`
  padding-top: 1em;
  margin-bottom: 12vh;
  background-color: var(--bg-color);
  position: relative;
  padding: 0 5%;
  & .baseline {
    font-weigth: 800;
    font-size: 3.5vw;
    line-height: 1.2em;
  }
  & .subbaseline {
    color: var(--font-color2);
    font-size: 1.5vw;
  }
  & .login {
    position: absolute;
    right: 0;
  }
  & .login button {
  }
  & .new-game {
    position: absolute;
    top: 2em;
    right: 0;
  }
  @media screen and (max-width: 640px) {
    & {
    }
    & .new-game {
    }
    & .login {
    }
    & .baseline {
    }
  }
`;

const Filter = styled.div`
  & .incentive {
    width: 100%;
    text-align: center;
    font-size: 3.5vw;
    padding: 0.5em;
  }
`;

const Content = styled.div`
  background-color: var(--bg-secondary-color);
`;

const GameList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0 5%;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 5%;

  @media screen and (max-width: 640px) {
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
      setGameList(
        content.sort((a, b) => {
          const [nameA, nameB] = [
            a.board.defaultName || a.board.name,
            b.board.defaultName || b.board.name,
          ];
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0;
        })
      );
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
            <h1>
              <a href="/">Air Board Game</a>
            </h1>
            <span className="beta">Beta</span>
          </Brand>
          <Trans i18nKey="baseline">
            <h2 className="baseline">
              Play board games online
              <br />
              with your friends - for free!
            </h2>
            <p className="subbaseline">
              Choose from our selection or create your own.
              <br />
              No need to sign up. Just start a game and share the link with your
              friends.
            </p>
          </Trans>
        </Header>
        <Content>
          <Filter>
            <h2 className="incentive">{t("Start a game now")}</h2>
          </Filter>
          <GameList>
            {gameList
              .filter(
                ({ published, owner }) =>
                  published || (userId && (!owner || owner === userId))
              )
              .map((game) => (
                <GameListItem key={game.id} game={game} userId={userId} />
              ))}
          </GameList>
        </Content>
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
