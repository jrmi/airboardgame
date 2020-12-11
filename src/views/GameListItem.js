import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getBestTranslationFromConfig } from "../utils/api";

const Game = styled.li`
  position: relative;
  //min-width: 240px;
  //max-width: 22%;
  //height: 150px;
  padding: 0em;
  //margin: 0.3em;
  margin: 0px;
  margin-bottom: 3em;
  flex: 1;
  //box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;

  //border: 1px dashed blue;

  & .game-name {
    max-width: 80%;
    /*text-overflow: ellipsis;
    white-space: nowrap;*/
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
    //max-width: 25vw;
    width: 100%;
    min-width: 300px;
    max-width: 600px;
    //padding-top: 60%;
    background-color: #333;
  }

  & .details {
    display: flex;
    flex-direction: row;
    color: var(--font-color2);
    font-size: 12px;
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
      <Link to={`/game/${id}/session/`}>
        {imageUrl ? (
          <img className="img" src={imageUrl} />
        ) : (
          <img className="img" src="/default.png" />
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
        {playerCount && (
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
        {duration && <span>{durationDisplay} mins</span>}
        {minAge !== undefined && <span>age {minAge}+</span>}
      </div>

      <h2 className="game-name">{translation.name}</h2>

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

/*
      <Link to={`/game/${id}/session/`} className="button play">
        {t("Play")}
      </Link>;
*/

export default GameListItem;
