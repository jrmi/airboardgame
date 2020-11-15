import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getBestTranslationFromConfig } from "../utils/api";

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
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
  background: ${(props) =>
    props.back
      ? `url(${props.back}), rgba(255, 255, 255, 0.6)`
      : "var(--bg-secondary-color)"};
  background-blend-mode: screen;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;

  /*&:before {
    position: absolute;
    content: " ";
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    background-color: rgba(0, 0, 0, 0.5);
  }*/

  & .game-name {
    margin: 0;
    max-width: 80%;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.2em;
    overflow: hidden;
    margin-bottom: 3px;
    font-size: 1.5em;
  }

  & .unpublished {
    position: absolute;
    top: 0.5em;
    right: 0.5em;
    padding: 0em;
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

  & .details {
    display: flex;
    flex-direction: column;
    color: var(--color-lightGrey);
    font-size: 0.8em;
  }
  & .details > span {
    display: flex;
    align-items: center;
    padding: 1px;
  }
  & .details img {
    margin-right: 0.5em;
  }
`;

const backgroundImage = false;

const GameListItem = ({
  game: {
    published,
    owner,
    id,
    minAge,
    materialLanguage,
    duration,
    playerCount,
    imageUrl,
  },
  game,
  userId,
}) => {
  const { t, i18n } = useTranslation();

  const translation = React.useMemo(
    () => getBestTranslationFromConfig(game, i18n.languages),
    [game, i18n.languages]
  );

  let playerCountDisplay;
  if (playerCount) {
    const [min, max] = playerCount;
    if (min === max) {
      if (max === 9) {
        playerCountDisplay = ["9+"];
      } else {
        playerCountDisplay = [max];
      }
    } else {
      if (max === 9) {
        playerCountDisplay = [min, "9+"];
      } else {
        playerCountDisplay = [min, max];
      }
    }
  }

  let durationDisplay;
  if (duration) {
    const [min, max] = duration;
    if (min === max) {
      if (max === 90) {
        durationDisplay = "90+";
      } else {
        durationDisplay = `~${max}`;
      }
    } else {
      if (max === 90) {
        durationDisplay = `${min}~90+`;
      } else {
        durationDisplay = `${min}~${max}`;
      }
    }
  }

  let materialLanguageDisplay = t(materialLanguage);

  return (
    <Game back={backgroundImage ? imageUrl : null}>
      <h2 className="game-name">{translation.name}</h2>
      {!published && (
        <img
          className="unpublished"
          src="https://icongr.am/entypo/eye-with-line.svg?size=32&color=888886"
          alt={t("Unpublished")}
        />
      )}
      <div className="details">
        {playerCount && (
          <span>
            <img
              src="https://icongr.am/entypo/users.svg?size=16&color=888886"
              alt={t("Players count")}
            />{" "}
            {playerCountDisplay.length === 2 &&
              t("{{min}} - {{max}} players", {
                min: playerCountDisplay[0],
                max: playerCountDisplay[1],
              })}
            {playerCountDisplay.length === 1 &&
              t("{{count}} player", {
                count: playerCountDisplay[0],
              })}
          </span>
        )}
        {duration && (
          <span>
            <img
              src="https://icongr.am/entypo/hour-glass.svg?size=16&color=888886"
              alt={t("Duration")}
            />{" "}
            {durationDisplay}
          </span>
        )}
        {minAge !== undefined && (
          <span>
            <img
              src="https://icongr.am/entypo/man.svg?size=16&color=888886"
              alt={t("Minimum age")}
            />{" "}
            {minAge}+
          </span>
        )}
        {materialLanguage !== undefined && (
          <span>
            <img
              src="https://icongr.am/entypo/globe.svg?size=16&color=888886"
              alt={t("Material language")}
            />{" "}
            {materialLanguageDisplay}
          </span>
        )}
      </div>
      <Link to={`/game/${id}/session/`} className="button play">
        {t("Play")}
      </Link>
      {userId && (userId === owner || !owner) && (
        <div className="extra-actions">
          <Link to={`/game/${id}/edit`} className="button edit icon-only">
            <img
              src="https://icongr.am/feather/edit.svg?size=16&color=ffffff"
              alt={t("Edit")}
            />
          </Link>
        </div>
      )}
    </Game>
  );
};

export default GameListItem;
