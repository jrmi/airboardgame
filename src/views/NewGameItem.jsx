import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Game = styled.li`
  position: relative;
  padding: 0em;
  margin: 0px;

  & .game-name {
    max-width: 80%;
    line-height: 1.2em;
    overflow: hidden;
    margin-bottom: 3px;
    margin: 0.2em 0 0.5em 0;
    font-size: 2.3vw;
  }

  & .img-wrapper {
    display: block;
    position: relative;
    width: 100%;
    padding-top: 64.5%;
    & > span {
      background-color: var(--color-blueGrey);
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      overflow: hidden;
      display: flex;
      justify-content: center;
      border-radius: 5px;
      & img {
        flex: 0;
      }
    }
  }

  @media screen and (max-width: 1024px) {
    & {
      flex-basis: 45%;
    }
    & .details {
      font-size: 12px;
    }
    & .game-name {
      font-size: 28px;
    }
  }

  @media screen and (max-width: 640px) {
    & {
      flex-basis: 100%;
    }
    & .game-name {
      font-size: 24px;
    }
  }
`;

const GameListItem = () => {
  const { t } = useTranslation();

  return (
    <Game>
      <Link to={"/game/"} className="img-wrapper">
        <span>
          <img
            src={
              "https://icongr.am/entypo/squared-plus.svg?size=128&color=f9fbfa"
            }
            alt={t("Create a new game")}
            title={t("Create a new game")}
          />
        </span>
      </Link>
      <div className="details">
        <span></span>
      </div>

      <h2 className="game-name">{t("Create a new game")}</h2>
    </Game>
  );
};

export default GameListItem;
