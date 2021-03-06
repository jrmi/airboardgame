import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { deleteGame, getBestTranslationFromConfig } from "../utils/api";
import { confirmAlert } from "react-confirm-alert";
import { toast } from "react-toastify";

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

  & .unpublished {
    position: absolute;
    top: 0.5em;
    left: 0.5em;
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
    z-index: 2;
  }

  &:hover .extra-actions,
  & .extra-actions:hover {
    display: block;
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
      display: block;
      display: flex;
      border-radius: 5px;
      & > .back {
        filter: blur(5px);
        background-size: cover;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
      }
    }
  }

  & .img {
    object-fit: contain;
    width: 100%;
    height: 100%;
    z-index: 1;
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
  onDelete,
}) => {
  const { t, i18n } = useTranslation();

  const translation = React.useMemo(
    () => getBestTranslationFromConfig(game, i18n.languages),
    [game, i18n.languages]
  );

  const deleteGameHandler = async () => {
    confirmAlert({
      title: t("Confirmation"),
      message: t("Do you really want to remove this game ?"),
      buttons: [
        {
          label: t("Yes"),
          onClick: async () => {
            try {
              await deleteGame(id);
              onDelete(id);
              toast.success(t("Game deleted"), { autoClose: 1500 });
            } catch (e) {
              if (e.message === "Forbidden") {
                toast.error(t("Action forbidden. Try logging in again."));
              } else {
                console.log(e);
                toast.error(t("Error while deleting game. Try again later..."));
              }
            }
          },
        },
        {
          label: t("No"),
          onClick: () => {},
        },
      ],
    });
  };

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
      <Link to={`/game/${id}/session/`} className="img-wrapper">
        <span>
          {imageUrl && (
            <>
              <span
                className="back"
                style={{ backgroundImage: `url(${imageUrl})` }}
              />
              <img className="img" src={imageUrl} />
            </>
          )}
        </span>
      </Link>
      {userId && (userId === owner || !owner) && (
        <span className="extra-actions">
          <button
            onClick={deleteGameHandler}
            className="button edit icon-only error"
          >
            <img
              src="https://icongr.am/feather/trash.svg?size=16&color=ffffff"
              alt={t("Delete")}
            />
          </button>
          <Link to={`/game/${id}/edit`} className="button edit icon-only ">
            <img
              src="https://icongr.am/feather/edit.svg?size=16&color=ffffff"
              alt={t("Edit")}
            />
          </Link>
        </span>
      )}
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
    </Game>
  );
};

export default GameListItem;
