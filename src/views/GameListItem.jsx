import React from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { deleteGame, getBestTranslationFromConfig } from "../utils/api";
import { confirmAlert } from "react-confirm-alert";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "react-query";
import { media2Url } from "../mediaLibrary";
import { FiEdit, FiEyeOff, FiShare2, FiTrash2 } from "react-icons/fi";

const Game = styled.li`
  position: relative;
  padding: 0em;
  margin: 0px;
  min-width: 0; /* Fix for ellipsis */
  height: 100%;
  display: flex;
  flex-direction: column;

  & .game-name {
    margin: 0.35em 0 0.1em;
    overflow: hidden;
    font-size: clamp(1.25rem, 2vw, 2rem);
    line-height: 1.1em;
    white-space: nowrap;
    text-overflow: ellipsis;
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
    z-index: 4;
    & .button {
      border-radius: 4px;
    }
  }

  & .baseline {
    position: absolute;
    z-index: 3;
    inset: 0;
    box-sizing: border-box;
    max-height: none;
    margin: 0;
    padding: 50% 0.75em 0.75em;
    overflow: hidden;
    background: linear-gradient(transparent 20%, #111111f5 58%);
    color: var(--font-color);
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4;
    line-height: 1.25;
    opacity: 0;
    transform: translateY(0.5em);
    transition:
      opacity 180ms ease,
      transform 180ms ease;
    pointer-events: none;
  }

  &:hover .baseline {
    opacity: 1;
    transform: translateY(0);
  }

  &:hover .extra-actions,
  & .extra-actions:hover {
    display: block;
  }

  & .img-wrapper {
    display: block;
    position: relative;
    margin: 0;
    padding: 0;
    width: 100%;
    padding-top: 64.5%;
    & > span {
      background-color: var(--color-blueGrey);
      ${({ $fallback }) =>
        $fallback
          ? `background-image: url("${DEFAULT_IMAGE_URL}");
             background-position: center;
             background-size: cover;`
          : ""};
      ${({ $other }) => (!$other ? "" : "border: 1px solid red")};

      position: absolute;
      inset: 0;
      overflow: hidden;
      display: block;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 5px;
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
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4em;
    color: var(--font-color2);
    font-size: 14px;
    padding-top: 1em;
    min-height: 2.5em;
  }

  & .details > span {
    display: inline-flex;
    align-items: center;
    padding: 0.25em 0.6em;
    border: 1px solid var(--color-border-subtle);
    border-radius: 999px;
    background-color: var(--color-darkBlueGrey);
    white-space: nowrap;
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
  }

  @media screen and (max-width: 640px) {
    & {
      flex-basis: 100%;
    }
  }
`;

const getGameUrl = (id) => `${window.location.origin}/playgame/${id}`;
const DEFAULT_IMAGE_URL = "/game_assets/default.png";

const GameListItem = ({
  game: {
    owner,
    id,
    board: {
      minAge,
      materialLanguage,
      duration,
      playerCount,
      published,
      imageUrl,
    } = {},
  },
  game,
  userId,
  onClick: propOnClick,
  onDelete,
  isAdmin = false,
  studio = false,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deleteMutation = useMutation((gameId) => deleteGame(gameId), {
    onSuccess: () => {
      queryClient.invalidateQueries("ownGames");
      queryClient.invalidateQueries("games");
    },
  });

  const realImageUrl = media2Url(imageUrl);

  const [showImage, setShowImage] = React.useState(Boolean(realImageUrl));
  const [usingFallbackImage, setUsingFallbackImage] =
    React.useState(!realImageUrl);

  const translation = React.useMemo(
    () => getBestTranslationFromConfig(game.board, i18n.languages),
    [game, i18n.languages]
  );

  const onClick = React.useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (propOnClick) {
        return propOnClick(id);
      } else {
        navigate(`/playgame/${id}`);
      }
    },
    [navigate, id, propOnClick]
  );

  const onShare = React.useCallback(
    async (e) => {
      e.stopPropagation();
      e.preventDefault();

      await navigator.clipboard.writeText(getGameUrl(id));
      toast.info(t("Url copied to clipboard!"), { autoClose: 1000 });
    },
    [id, t]
  );

  const deleteGameHandler = async () => {
    confirmAlert({
      title: t("Confirmation"),
      message: t("Do you really want to remove this game?"),
      buttons: [
        {
          label: t("Yes"),
          onClick: async () => {
            try {
              deleteMutation.mutate(id);
              if (onDelete) onDelete(id);
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

  const owned = userId && (userId === owner || !owner);

  return (
    <Game $other={!owned && studio} $fallback={usingFallbackImage}>
      <a href={`/playgame/${id}`} className="img-wrapper">
        <span onClick={onClick}>
          {showImage && (
            <>
              <img
                className="img"
                src={realImageUrl}
                alt={translation.name}
                onError={() => {
                  setShowImage(false);
                  setUsingFallbackImage(true);
                }}
              />
            </>
          )}
        </span>
      </a>
      <span className="extra-actions">
        <a
          href={getGameUrl(id)}
          className="button edit icon-only success"
          onClick={onShare}
        >
          <FiShare2
            alt={t("Share game link")}
            title={t("Share game link")}
            size="16"
            color="white"
          />
        </a>
        {(owned || isAdmin) && (
          <>
            <button
              onClick={deleteGameHandler}
              className="button edit icon-only error"
            >
              <FiTrash2
                alt={t("Delete")}
                title={t("Delete")}
                size="16"
                color="white"
              />
            </button>
            <Link to={`/game/${id}/edit`} className="button edit icon-only ">
              <FiEdit
                alt={t("Edit")}
                title={t("Edit")}
                size="16"
                color="white"
              />
            </Link>
          </>
        )}
      </span>
      {!published && (
        <FiEyeOff
          className="unpublished"
          alt={t("Unpublished")}
          size="16"
          color="white"
        />
      )}
      <h2 className="game-name">{translation.name}</h2>

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

      {translation.baseline && (
        <p className="baseline">{translation.baseline}</p>
      )}
    </Game>
  );
};

export default GameListItem;
