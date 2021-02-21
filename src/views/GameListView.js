import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import styled from "styled-components";
import CookieConsent from "react-cookie-consent";

import { getGames } from "../utils/api";
import Account from "../components/Account";
import useAuth from "../hooks/useAuth";

import "react-confirm-alert/src/react-confirm-alert.css";
import useLocalStorage from "../hooks/useLocalStorage";
import GameListItem from "./GameListItem";

import AboutModal from "./AboutModal";

const GameView = styled.div`
  min-height: 100vh;
  flex-direction: column;
  & > footer {
    width: 100%;
    grid-column: 1 / 4;
    padding: 0.5em 0;
    text-align: center;
    background-color: #00000099;
  }
`;

const Brand = styled.div`
  position: relative;
  display: inline-block;
  & h1 {
    font-weight: 700;
    font-size: 24px;
    & a {
      color: var(--font-color);
    }
  }
  & .beta {
    position: absolute;
    top: 5px;
    left: 175px;
    text-transform: uppercase;
    font-weight: 300;
    font-size: 0.9em;
  }
`;

const Nav = styled.nav`
  background-color: var(--bg-color);
  position: relative;
  padding: 0 5%;
  display: flex;
  align-items: center;

  & .brand {
    flex: 1;
  }

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
  & .button:hover {
    color: var(--font-color);
    border-bottom: 1px solid var(--color-primary);
  }

  @media screen and (max-width: 640px) {
    & .button,
    & button {
      display: none;
    }
  }
`;

const Header = styled.header`
  background-color: var(--bg-color);
  position: relative;

  background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, 0.6) 40%,
      rgba(0, 0, 0, 0.6) 60%,
      rgba(0, 0, 0, 1) 100%
    ),
    100% 50% / contain no-repeat url(/hero.png);

  padding: 14vh 5%;
  margin-bottom: 20px;

  & .baseline {
    padding: 2px;
    font-weigth: 800;
    font-size: 3.2vw;
    line-height: 1.2em;
  }
  & .subbaseline {
    padding: 2px;
    color: var(--font-color2);
    font-size: 1.4vw;
  }

  @media screen and (max-width: 1024px) {
    & {
      padding: 1em 5%;
    }
    & .baseline {
      display: inline-block;
      background-color: #00000088;
      font-size: 32px;
    }
    & .subbaseline {
      display: inline-block;
      background-color: #00000088;
      font-size: 16px;
    }
  }

  @media screen and (max-width: 640px) {
    & {
      display: none;
    }
  }
`;

const Filter = styled.div`
  & .incentive {
    width: 100%;
    text-align: center;
    font-size: 3.5vw;
    padding: 0.5em;
    margin: 0;
  }
  @media screen and (max-width: 1024px) {
    & .incentive {
      font-size: 32px;
    }
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
    let mounted = true;

    const loadGames = async () => {
      const content = await getGames();
      if (!mounted) return;

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
    };

    loadGames();
    return () => {
      mounted = false;
    };
  }, []);

  const forceBeta = query.get("beta") === "true";

  React.useEffect(() => {
    if (forceBeta) {
      setIsBeta(true);
    }
  }, [forceBeta, setIsBeta]);

  return (
    <>
      <GameView>
        <Nav>
          <Brand className="brand">
            <h1>
              <Link to="/">Air Board Game</Link>
            </h1>
            <span className="beta">Beta</span>
          </Brand>
          {isAuthenticated && (
            <Link to={`/game/`} className="button new-game">
              {t("Create new game")}
            </Link>
          )}
          <Account className="login" disabled={!cookieConsent} />
          <a
            className="icon button"
            href="https://github.com/jrmi/airboardgame"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://icongr.am/feather/github.svg?size=16&color=ffffff"
              alt={t("Github")}
              title={t("Github")}
            />
          </a>
        </Nav>
        <Header>
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
