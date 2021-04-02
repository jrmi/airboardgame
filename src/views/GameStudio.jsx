import React from "react";
import { Redirect } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import { getGames } from "../utils/api";
import useAuth from "../hooks/useAuth";

import { StyledGameList } from "./StyledGameList";
import NewGameItem from "./NewGameItem";
import GameListItem from "./GameListItem";

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

const GameListView = () => {
  const { t } = useTranslation();

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

  const onGameDelete = React.useCallback((idToRemove) => {
    setGameList((prevList) => {
      return prevList.filter(({ id }) => id !== idToRemove);
    });
  }, []);

  if (!isAuthenticated) {
    return <Redirect to="/games/" />;
  }

  return (
    <Content>
      <Filter>
        <h2 className="incentive">{t("Your games")}</h2>
      </Filter>
      <StyledGameList>
        <NewGameItem />
        {gameList
          .filter(({ owner }) => userId && (!owner || owner === userId))
          .map((game) => (
            <GameListItem
              key={game.id}
              game={game}
              userId={userId}
              onDelete={onGameDelete}
            />
          ))}
      </StyledGameList>
    </Content>
  );
};

export default GameListView;
