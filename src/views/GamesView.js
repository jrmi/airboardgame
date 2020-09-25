import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { IS_PRODUCTION } from "../utils/settings";
import { getGames, deleteGame } from "../utils/api";

import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

import styled from "styled-components";

const GameView = styled.ul`
  width: 50%;
  margin: 0 auto;
  position: relative;
  & .new-game {
    position: absolute;
    top: 1em;
    right: 2px;
  }
  & h1 {
    color: hsl(210, 14%, 75%);
  }
`;

const GameList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const Game = styled.li`
  width: 100%;
  background-color: hsl(210, 26%, 19%);
  color: hsl(210, 14%, 75%);
  display: flex;
  justify-content: space-between;

  & .game-name {
    margin: 0 1em;
  }

  & .button {
    margin: 0 2px;
  }

  & .action {
    padding: 0.6em 0;
  }
`;

const GamesView = () => {
  const { t } = useTranslation();
  const [gameList, setGameList] = React.useState([]);

  React.useEffect(() => {
    getGames().then((content) => {
      if (!IS_PRODUCTION) {
        setGameList(content);
        return;
      }
      setGameList(content);
    });
  }, [t]);

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

  return (
    <GameView>
      <Link to={`/game/`} className="button new-game">
        Create new game
      </Link>
      <h1>Game list</h1>
      <GameList>
        {gameList.map(({ name, id }) => (
          <Game key={id}>
            <h2 className="game-name">{name}</h2>
            <div className="action">
              <Link to={`/game/${id}/session/`} className="button success">
                play
              </Link>
              <Link to={`/game/${id}/edit`} className="button">
                edit
              </Link>
              <button onClick={handleRemove(id)} className="button error">
                X
              </button>
            </div>
          </Game>
        ))}
      </GameList>
    </GameView>
  );
};

export default GamesView;
