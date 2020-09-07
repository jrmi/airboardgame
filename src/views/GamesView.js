import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { IS_PRODUCTION } from "../utils/settings";
import { getGames, deleteGame } from "../utils/api";

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
    deleteGame(idToRemove);
    setGameList(gameList.filter(({ id }) => id !== idToRemove));
  };

  return (
    <>
      <ul style={{ color: "#fff" }}>
        {gameList.map(({ name, id }) => (
          <li key={id}>
            {name}
            <Link to={`/game/${id}/session/`} className="button">
              play
            </Link>
            <Link to={`/game/${id}/edit`} className="button">
              edit
            </Link>
            <button onClick={handleRemove(id)} className="button">
              remove
            </button>
          </li>
        ))}
      </ul>

      <Link to={`/game/`} className="button">
        New game
      </Link>
    </>
  );
};

export default GamesView;
