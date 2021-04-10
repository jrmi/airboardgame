import React from "react";
import { useTranslation, Trans } from "react-i18next";
import styled from "styled-components";
import Diacritics from "diacritic";

import { getGames } from "../utils/api";
import SliderRange from "../ui/SliderRange";

import {
  StyledGameList,
  StyledGameFilters,
  StyledGameResultNumber,
} from "./StyledGameList";

import GameListItem from "./GameListItem";

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

const cleanWord = function (word) {
  return Diacritics.clean(word).toLowerCase();
};

const GameListView = () => {
  const { t } = useTranslation();
  const NULL_SEARCH_TERM = "";

  const [gameList, setGameList] = React.useState([]);
  const [filterCriteria, setFilterCriteria] = React.useState({
    searchTerm: NULL_SEARCH_TERM,
    nbOfPlayersMin: 1,
    nbOfPlayersMax: 9,
  });

  const filteredGameList = React.useMemo(() => {
    return gameList.filter((game) => {
      return (
        (filterCriteria.searchTerm === NULL_SEARCH_TERM ||
          cleanWord(game.defaultName).includes(
            cleanWord(filterCriteria.searchTerm)
          )) &&
        filterCriteria.nbOfPlayersMin <= game.playerCount[1] &&
        filterCriteria.nbOfPlayersMax >= game.playerCount[0]
      );
    });
  }, [gameList, filterCriteria]);

  React.useEffect(() => {
    let mounted = true;

    const loadGames = async () => {
      const content = await getGames();
      if (!mounted) return;

      setGameList(
        content
          .filter((game) => game.published)
          .sort((a, b) => {
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

  const onChangeNbOfPlayersSlider = function (values) {
    setFilterCriteria({
      ...filterCriteria,
      nbOfPlayersMin: values[0],
      nbOfPlayersMax: values[1],
    });
  };

  const onChangeSearchTerm = (event) => {
    setFilterCriteria({
      ...filterCriteria,
      searchTerm: event.target.value,
    });
  };

  return (
    <>
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
          <StyledGameFilters>
            <li>
              <input
                type="search"
                id="game-search"
                name="game-search"
                aria-label={t("Search for a game")}
                placeholder={t("Search for a game")}
                value={filterCriteria.searchTerm}
                onChange={onChangeSearchTerm}
              />
            </li>
            <li>
              <span className="filter-title">{t("Number of players")}</span>
              <SliderRange
                defaultValue={[1, 9]}
                value={[
                  filterCriteria.nbOfPlayersMin,
                  filterCriteria.nbOfPlayersMax,
                ]}
                min={1}
                max={9}
                step={1}
                onChange={onChangeNbOfPlayersSlider}
              />
            </li>
          </StyledGameFilters>
          <StyledGameResultNumber>
            {t("games-available", { nbOfGames: `${filteredGameList.length}` })}
          </StyledGameResultNumber>
        </Filter>
        <StyledGameList>
          {filteredGameList.map((game) => (
            <GameListItem key={game.id} game={game} />
          ))}
        </StyledGameList>
      </Content>
    </>
  );
};

export default GameListView;
