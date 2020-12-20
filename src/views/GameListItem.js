import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getBestTranslationFromConfig } from "../utils/api";

const Game = styled.li`
  position: relative;
  padding: 0em;
  margin: 0px;
  margin-bottom: 3em;
  flex-basis: 30%;

  & .game-name {
    max-width: 80%;
    line-height: 1.2em;
    overflow: hidden;
    margin-bottom: 3px;
    margin: 0.2em 0 0.5em 0;
    font-size: 2.5vw;
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

  & .img {
    width: 100%;
    background-color: #333;
    border-radius: 5px;
  }

  & .details {
    display: flex;
    flex-direction: row;
    color: var(--font-color2);
    font-size: 14px;
    padding-top: 1em;
  }
  & .details > span {
    display: flex;
    align-items: center;
    padding-right: 5px;
    margin-right: 5px;
    border-right: 1px solid var(--font-color2);
  }
  & .details > span:last-child {
    border: none;
  }
  & .details img {
    margin-right: 0.5em;
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

  let playerCountDisplay = undefined;
  if (playerCount && playerCount.length) {
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

  let durationDisplay = undefined;
  if (duration && duration.length) {
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
    <Game>
      <Link to={`/game/${id}/session/`}>
        {imageUrl ? (
          <img className="img" src={imageUrl} />
        ) : (
          <img className="img" src="/default-game.png" />
        )}
      </Link>
      {!published && (
        <img
          className="unpublished"
          src="https://icongr.am/entypo/eye-with-line.svg?size=32&color=888886"
          alt={t("Unpublished")}
        />
      )}
      <div className="details">
        {playerCountDisplay && (
          <span>
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
        {durationDisplay && <span>{durationDisplay} mins</span>}
        {minAge && <span>age {minAge}+</span>}
        {materialLanguageDisplay && <span>{materialLanguageDisplay}</span>}
      </div>

      <h2 className="game-name">{translation.name}</h2>

      <p className="baseline">{translation.baseline}</p>

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
