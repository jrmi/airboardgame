import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { getGames, deleteGame } from "../utils/api";
import Account from "../components/Account";
import useAuth from "../hooks/useAuth";

import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import logo from "../images/logo-mono.png";
import header from "../images/header.jpg";

import styled from "styled-components";

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
    right: 8em;
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

const GameView = styled.div``;

const GameList = styled.ul`
  width: 960px;
  list-style: none;
  margin: 0;
  margin: 0 auto;
  padding: 0 2em;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
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

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const GameListView = () => {
  const { t } = useTranslation();
  let query = useQuery();
  const beta = query.get("beta") === "true";

  const [gameList, setGameList] = React.useState([]);
  const { isAuthenticated, userId } = useAuth();

  React.useEffect(() => {
    getGames().then((content) => {
      setGameList(content);
    });
  }, [isAuthenticated]);

  const handleRemove = (idToRemove) => async () => {
    confirmAlert({
      title: t("Confirmation"),
      message: t("Do you really want to remove selected items ?"),
      buttons: [
        {
          label: t("Yes"),
          onClick: () => {
            deleteGame(idToRemove);
            setGameList(gameList.filter(({ id }) => id !== idToRemove));
          },
        },
        {
          label: t("No"),
          onClick: () => {},
        },
      ],
    });
  };
  console.log(beta);

  return (
    <GameView>
      <Header>
        {beta && isAuthenticated && (
          <Link to={`/game/`} className="button new-game">
            {t("Create new game")}
          </Link>
        )}
        {beta && <Account className="login" />}
        <Brand className="brand">
          <a href="/">
            <img src={logo} alt="logo" />
          </a>
          <h1>Air Board Game</h1>
        </Brand>
        <h2 className="baseline">
          Play your favorite games online with your friends
        </h2>
      </Header>
      <GameList>
        {gameList.map(({ name, id, owner }) => (
          <Game key={id}>
            <h2 className="game-name">{name}</h2>
            <Link to={`/game/${id}/session/`} className="button play">
              {t("Play")}
            </Link>
            {beta && userId === owner && (
              <div className="extra-actions">
                <Link to={`/game/${id}/edit`} className="button edit icon-only">
                  <img
                    src="https://icongr.am/feather/edit.svg?size=16&color=ffffff"
                    alt="info"
                  />
                </Link>
                <button
                  onClick={handleRemove(id)}
                  className="button delete icon-only"
                >
                  <img
                    src="https://icongr.am/feather/trash.svg?size=16&color=ffffff"
                    alt="info"
                  />
                </button>
              </div>
            )}
          </Game>
        ))}
      </GameList>
    </GameView>
  );
};

export default GameListView;
