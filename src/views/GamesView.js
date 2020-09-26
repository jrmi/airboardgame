import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { IS_PRODUCTION } from "../utils/settings";
import { getGames, deleteGame } from "../utils/api";

import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

import styled from "styled-components";

const GameView = styled.ul`
  margin: 0 auto;
  position: relative;
  & .new-game {
    position: absolute;
    top: 1em;
    right: 1em;
  }
  & h1 {
    color: hsl(210, 14%, 75%);
  }
`;

const GameList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
`;

const Game = styled.li`
  width: 100%;
  background-color: hsl(210, 26%, 19%);
  color: hsl(210, 14%, 75%);
  position: relative;
  min-width: 300px;
  max-width: 350px;
  height: 150px;
  padding: 1em;
  margin: 1em;
  flex: 1 1 0%;
  width: & .game-name {
    margin: 0 1em;
  }

  & .button {
    margin: 0 2px;
  }

  & .play {
    position: absolute;
    bottom: 0.5em;
    right: 0.5em;
  }

  & .extra-actions {
    position: absolute;
    bottom: 0.5em;
    left: 0.5em;
    display: none;
  }

  &:hover .extra-actions {
    display: block;
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
        {t("Create new game")}
      </Link>
      <h1>AirBoardGame</h1>
      <GameList>
        {gameList.map(({ name, id }) => (
          <Game key={id}>
            <h2 className="game-name">{name}</h2>
            <Link to={`/game/${id}/session/`} className="button success play">
              {t("Play")}
            </Link>
            <div className="extra-actions">
              <Link to={`/game/${id}/edit`} className="button edit">
                {t("Edit")}
              </Link>
              <button
                onClick={handleRemove(id)}
                className="button error delete"
              >
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
