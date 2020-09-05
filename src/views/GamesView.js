import React from "react";
import { Link } from "react-router-dom";

import { useTranslation } from "react-i18next";

import { useC2C } from "../hooks/useC2C";
import { nanoid } from "nanoid";

import { IS_PRODUCTION } from "../utils/settings";

import { getGames } from "../utils/api";

const fetchGame = async (url) => {
  const result = await fetch(url);
  return await result.json();
};

const GamesView = () => {
  const { t } = useTranslation();
  const [gameList, setGameList] = React.useState([]);

  React.useEffect(() => {
    getGames().then((content) => {
      if (!IS_PRODUCTION) {
        setGameList([
          ...content,

          {
            name: t("New Game"),
            data: {
              items: [],
              availableItems: [],
              board: { size: 1000, scale: 0.5 },
            },
            id: null,
          },
        ]);
        return;
      }
      setGameList(content);
    });
  }, [t]);

  return (
    <ul style={{ color: "#fff" }}>
      {gameList.map(({ name, id }) => (
        <li key={id}>
          {name}
          <Link to={`/game/${id}/session/`} className="button">
            play
          </Link>
          <Link to={`/game/${id}/`} className="button">
            edit
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default GamesView;
