import React from "react";
import { nanoid } from "nanoid";
import styled from "styled-components";

import { RoomWrapper, useWire, useUsers } from "react-sync-board";

import { Routes, Route, Link, useParams } from "react-router-dom";
import Session from "../Session";

import RoomNavBar from "./RoomNavBar";

import { useTranslation } from "react-i18next";
import { useSocket } from "@jrmi/use-socket.io";
import Waiter from "../../ui/Waiter";
import { getSession } from "../../utils/api";
import useUniqueUsername from "../../users/useUniqueUsername";

const StyledPlayer = styled.li`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  max-width: 8rem;
  overflow: hidden;
  color: rgba(232, 239, 255, 0.82);
  font-size: 0.85rem;
  text-overflow: ellipsis;
  white-space: nowrap;

  &::before {
    content: "";
    flex: 0 0 0.55rem;
    width: 0.55rem;
    height: 0.55rem;
    border-radius: 50%;
    background: ${({ $color }) => $color || "#b8ceff"};
    box-shadow: 0 0 8px ${({ $color }) => $color || "#b8ceff"};
  }
`;

const StyledPlayers = styled.ul`
  position: absolute;
  right: 1.5rem;
  bottom: 1rem;
  left: 1.5rem;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 0.75rem;
  justify-content: center;
  pointer-events: none;
`;

const StyledRoom = styled.div`
  padding-top: 3em;
  background:
    radial-gradient(
      circle at 50% -20%,
      rgba(92, 126, 190, 0.22),
      transparent 42%
    ),
    linear-gradient(145deg, #111822 0%, var(--color-darkGrey) 48%, #10151d 100%);
  min-height: 100vh;

  h3 {
    margin: 1.25rem 1rem 2rem;
    color: #f4f7ff;
    font-size: clamp(1.5rem, 3vw, 2rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
  }

  & .tables {
    max-width: 1240px;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 1.5rem;
    margin: 0 auto;
    padding: 0 1.5rem 3rem;
  }

  & ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
`;

const StyledTable = styled.li`
  position: relative;
  width: min(250px, calc(50vw - 2.5rem));
  aspect-ratio: 1;
  border: 1px solid ${({ $accent }) => `${$accent}66`};
  border-radius: 22px;
  background: ${({ $surface }) => $surface};
  box-shadow:
    0 18px 35px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: ${({ $add }) => ($add ? "0.5" : "1")};
  overflow: hidden;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    border-color 180ms ease,
    opacity 180ms ease;

  &::before {
    content: "";
    position: absolute;
    inset: 1rem;
    border: 1px solid ${({ $accent }) => `${$accent}55`};
    border-radius: 15px;
    background: linear-gradient(
      145deg,
      ${({ $accent }) => `${$accent}22`},
      rgba(10, 16, 26, 0.34)
    );
    opacity: ${({ $add }) => ($add ? "0" : "1")};
  }

  & a {
    z-index: 1;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    color: #dbe7ff;
    text-shadow: 0 3px 12px rgba(0, 0, 0, 0.55);
    transition: color 180ms ease;
  }

  & .tableNumber {
    color: rgba(232, 239, 255, 0.9);
    font-size: 2.45em;
    font-weight: 650;
    letter-spacing: -0.04em;
    line-height: 1;
  }

  & .tableInfo {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
    margin-top: 0.9rem;
    font-size: 1.2rem;
    font-weight: 600;
    letter-spacing: 0;
    text-shadow: none;
  }

  & .tableGame {
    max-width: 13rem;
    overflow: hidden;
    color: #ffffff;
    font-weight: 700;
    line-height: 1.2;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & .tablePlayers {
    color: rgba(232, 239, 255, 0.88);
    font-size: 1rem;
    font-weight: 500;
  }

  & .addTable {
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    border: 0;
    background: transparent;
    color: #dbe7ff;
    font: inherit;
    font-size: 1rem;
    cursor: pointer;

    &::before {
      content: "+";
      display: grid;
      width: 2.5rem;
      height: 2.5rem;
      place-items: center;
      border: 1px solid rgba(181, 205, 255, 0.5);
      border-radius: 50%;
      color: #b8ceff;
      font-size: 1.8rem;
      line-height: 1;
    }
  }
  & .removeTable {
    z-index: 2;
    position: absolute;
    top: 0;
    right: 0;
    background: none;
    display: none;
  }

  &:hover {
    opacity: 1;
    transform: translateY(-7px);
    border-color: ${({ $accent }) => $accent};
    box-shadow:
      0 24px 42px rgba(0, 0, 0, 0.38),
      0 0 0 4px rgba(108, 147, 220, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.12);
  }

  &:hover a {
    color: #ffffff;
  }

  &:hover .removeTable {
    display: block;
  }
`;

const tableThemes = [
  {
    accent: "#8cb4ff",
    surface: "linear-gradient(145deg, #304b78, #182338)",
  },
  {
    accent: "#f49a8e",
    surface: "linear-gradient(145deg, #70404b, #281e2b)",
  },
  {
    accent: "#72d6b4",
    surface: "linear-gradient(145deg, #285d5b, #182b35)",
  },
  {
    accent: "#f4c56f",
    surface: "linear-gradient(145deg, #69522d, #29251e)",
  },
  {
    accent: "#c6a2ff",
    surface: "linear-gradient(145deg, #55406e, #252137)",
  },
];

const Room = ({ roomId, room, setRoom }) => {
  const { t, i18n } = useTranslation();
  const { users, joinSpace } = useUsers();

  const { isMaster } = useWire("room");

  useUniqueUsername();
  const [sessionBoards, setSessionBoards] = React.useState({});

  const onAdd = () => {
    setRoom((prev) => ({
      ...prev,
      sessions: [...prev.sessions, { id: nanoid() }],
    }));
  };

  const onRemove = (idToRemove) => {
    setRoom((prev) => ({
      ...prev,
      sessions: prev.sessions.filter(({ id }) => id !== idToRemove),
    }));
  };

  React.useEffect(() => {
    joinSpace(roomId);
  }, [joinSpace, roomId]);

  React.useEffect(() => {
    let cancelled = false;

    Promise.all(
      room.sessions.map(async ({ id }) => {
        try {
          const session = await getSession(id);
          return [id, session.board];
        } catch {
          return [id, null];
        }
      })
    ).then((entries) => {
      if (!cancelled) {
        setSessionBoards(Object.fromEntries(entries));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [room.sessions]);

  const usersBySpace = React.useMemo(
    () =>
      room.sessions.map(({ id: sessionId }) => ({
        id: sessionId,
        users: users.filter(({ space }) => space === sessionId),
      })),
    [room.sessions, users]
  );

  const getGameName = React.useCallback(
    (board) => {
      if (!board) return t("Game");

      const language = i18n.language?.split("-")[0];
      return (
        board.translations?.find(({ language: itemLanguage }) =>
          itemLanguage?.startsWith(language)
        )?.name ||
        board.defaultName ||
        board.name ||
        t("Game")
      );
    },
    [i18n.language, t]
  );

  return (
    <StyledRoom>
      <RoomNavBar />

      <h3>{t("Choose your board")}</h3>
      <ul className="tables">
        {usersBySpace.map(({ id: sessionId, users: spaceUsers }, index) => (
          <StyledTable
            key={sessionId}
            $accent={tableThemes[index % tableThemes.length].accent}
            $surface={tableThemes[index % tableThemes.length].surface}
          >
            <StyledPlayers className="players">
              {spaceUsers.map((user, index) => {
                return (
                  <StyledPlayer key={user.uid} $color={user.color}>
                    {user.name || `${t("Users")} ${index + 1}`}
                  </StyledPlayer>
                );
              })}
            </StyledPlayers>
            <Link
              to={`/room/${roomId}/session/${sessionId}`}
              aria-label={`${t("Game")}: ${getGameName(
                sessionBoards[sessionId]
              )}`}
            >
              <span className="tableNumber">#{index + 1}</span>
              <span className="tableInfo">
                <span className="tableGame">
                  {getGameName(sessionBoards[sessionId])}
                </span>
                <span className="tablePlayers">
                  {spaceUsers.length} {t("Users")}
                </span>
              </span>
            </Link>
            {isMaster && spaceUsers.length === 0 && (
              <button
                className="removeTable"
                onClick={() => onRemove(sessionId)}
              >
                X
              </button>
            )}
          </StyledTable>
        ))}
        {isMaster && (
          <StyledTable
            $add
            $accent="#8cb4ff"
            $surface="linear-gradient(145deg, #263756, #182131)"
          >
            <button className="addTable" onClick={onAdd}>
              {t("Add new table")}
            </button>
          </StyledTable>
        )}
      </ul>
    </StyledRoom>
  );
};

const SubscribeRoomEvents = ({ room, setRoom }) => {
  const { wire, isMaster } = useWire("room");
  const roomRef = React.useRef(room);
  roomRef.current = room;

  // Register at startup
  React.useEffect(() => {
    const unsub = [];
    // Master register getRoom for peers
    if (isMaster) {
      const registerPromise = wire.register("getRoom", () => {
        return roomRef.current;
      });
      unsub.push(() => registerPromise.then((unregister) => unregister()));
    } else {
      // Others subscribe to roomUpdate
      unsub.push(
        wire.subscribe("roomUpdate", (newRoom) => {
          setRoom(newRoom);
        })
      );
    }
    return () => {
      unsub.forEach((u) => u());
    };
  }, [wire, isMaster, setRoom]);

  // Get Room from master at connection
  React.useEffect(() => {
    if (!isMaster) {
      const onGetRoom = (roomData) => {
        setRoom(roomData);
      };

      wire.call("getRoom").then(onGetRoom, () => {
        // retry later
        setTimeout(() => {
          wire.call("getRoom").then(onGetRoom, (error) => console.log(error));
        }, 2000);
      });
    }
  }, [wire, isMaster, setRoom]);

  // Send room update on change if master
  React.useEffect(() => {
    if (isMaster) {
      wire.publish("roomUpdate", room);
    }
  }, [wire, isMaster, room]);

  return null;
};

const StartSession = () => {
  const { sessionId } = useParams();
  return <Session sessionId={sessionId} />;
};

const RoomView = ({ roomId }) => {
  const [room, setRoom] = React.useState(() => ({
    sessions: [{ id: nanoid() }, { id: nanoid() }, { id: nanoid() }],
  }));

  return (
    <>
      <Routes>
        <Route
          path=""
          element={<Room roomId={roomId} room={room} setRoom={setRoom} />}
        />
        <Route path="session/:sessionId" element={<StartSession />} />
      </Routes>
      <SubscribeRoomEvents room={room} setRoom={setRoom} />
    </>
  );
};

const ConnectedRoomView = (props) => {
  const socket = useSocket();
  return (
    <RoomWrapper room={props.roomId} socket={socket} LoadingComponent={Waiter}>
      <RoomView {...props} />
    </RoomWrapper>
  );
};

export default ConnectedRoomView;
