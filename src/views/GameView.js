import React, { useRef } from "react";
import { useParams, useHistory } from "react-router-dom";
import { nanoid } from "nanoid";
import { Provider } from "@scripters/use-socket.io";

import { C2CProvider } from "../hooks/useC2C";
import { SOCKET_URL, SOCKET_OPTIONS } from "../utils/settings";
import { createGame } from "../utils/api";

import BoardView from "../views/BoardView";
import Waiter from "../ui/Waiter";

import GameProvider from "./GameProvider";

const newGameData = {
  items: [],
  availableItems: [],
  board: { size: 1000, scale: 1, name: "New game" },
};

export const ConnectedGameProvider = ({ create = false, editMode = false }) => {
  const { room = nanoid(), gameId } = useParams();
  const history = useHistory();
  const creationRef = useRef(false);

  // 3 cas
  // Create -> jeux vide
  // Edit -> on va chercher du serveur
  // Play master -> on va chercher du serveur
  // Play slave -> on récupère du master

  // Create a new game as asked and redirect to it
  React.useEffect(() => {
    const createNewGame = async () => {
      const { _id: newGameId } = await createGame(newGameData);
      history.push(`/game/${newGameId}/`);
    };
    if (create && !creationRef.current) {
      createNewGame();
      creationRef.current = true;
    }
  }, [create, history]);

  if (create) {
    return <Waiter message={"Loading…"} />;
  }

  return (
    <Provider url={SOCKET_URL} options={SOCKET_OPTIONS}>
      <C2CProvider room={room}>
        <GameProvider gameId={gameId} room={room} create={create}>
          <BoardView namespace={gameId} editMode={editMode} />
        </GameProvider>
      </C2CProvider>
    </Provider>
  );
};

export default ConnectedGameProvider;
