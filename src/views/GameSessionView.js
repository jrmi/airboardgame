import React, { useContext, useRef } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useSetRecoilState, useRecoilCallback } from "recoil";
import { nanoid } from "nanoid";
import { Provider } from "@scripters/use-socket.io";

import { useC2C, C2CProvider } from "../hooks/useC2C";
import { getGame, createGame } from "../utils/api";
import { SOCKET_URL, SOCKET_OPTIONS } from "../utils/settings";

import SubscribeGameEvents from "../components/SubscribeGameEvents";
import { useItems } from "../components/Board/Items";
import {
  AvailableItemListAtom,
  AllItemsSelector,
  BoardConfigAtom,
} from "../components/Board";
import useBoardConfig from "../components/useBoardConfig";

import BoardView from "../views/BoardView";
import Waiter from "../ui/Waiter";

export const GameContext = React.createContext({});

const newGameData = {
  items: [],
  availableItems: [],
  board: { size: 1000, scale: 1, name: "New game" },
};

export const GameSessionView = ({ gameId, children }) => {
  const [c2c, joined, isMaster] = useC2C();
  const { setItemList } = useItems();
  const setAvailableItemList = useSetRecoilState(AvailableItemListAtom);
  const [, setBoardConfig] = useBoardConfig();

  const [gameLoaded, setGameLoaded] = React.useState(false);
  const gameLoadingRef = React.useRef(false);

  const sendLoadGameEvent = React.useCallback(
    (game) => {
      game.items = game.items.map((item) => ({ ...item, id: nanoid() }));
      c2c.publish("loadGame", game);
    },
    [c2c]
  );

  const setGame = React.useCallback(
    async (game) => {
      setGameLoaded(true);
      const originalGame = await getGame(gameId);
      if (originalGame) {
        setAvailableItemList(
          originalGame.availableItems.map((item) => ({ ...item, id: nanoid() }))
        );
      } else {
        setAvailableItemList(
          game.availableItems.map((item) => ({ ...item, id: nanoid() }))
        );
      }
      setItemList(game.items);
      setBoardConfig(game.board, false);
    },
    [setAvailableItemList, setBoardConfig, setItemList, gameId]
  );

  const getCurrentGame = useRecoilCallback(
    ({ snapshot }) => async () => {
      const availableItemList = await snapshot.getPromise(
        AvailableItemListAtom
      );
      const boardConfig = await snapshot.getPromise(BoardConfigAtom);
      const itemList = await snapshot.getPromise(AllItemsSelector);
      const game = {
        items: itemList,
        board: boardConfig,
        availableItems: availableItemList,
      };
      return game;
    },
    []
  );

  React.useEffect(() => {
    let isMounted = true;

    const loadGameData = async () => {
      try {
        const gameData = await getGame(gameId);
        if (!isMounted) return;
        setGame(gameData);
        sendLoadGameEvent(gameData);
      } catch (e) {
        console.log(e);
      }
    };
    if (gameId && isMaster && !gameLoaded) {
      gameLoadingRef.current = true;
      loadGameData();
    }
    return () => {
      isMounted = false;
    };
  }, [gameId, sendLoadGameEvent, isMaster, gameLoaded, setGame]);

  // Load game from master if any
  React.useEffect(() => {
    if (!gameLoaded && joined && !isMaster && !gameLoadingRef.current) {
      gameLoadingRef.current = true;
      c2c.call("getGame").then(setGame, () => {});
    }
  }, [c2c, isMaster, joined, gameLoaded, setGame]);

  return (
    <GameContext.Provider value={{ setGame, getGame: getCurrentGame, gameId }}>
      {children}
      <SubscribeGameEvents getGame={getCurrentGame} setGame={setGame} />
    </GameContext.Provider>
  );
};

export const useGame = () => {
  return useContext(GameContext);
};

export const ConnectedGameSessionView = ({
  create = false,
  editMode = false,
}) => {
  const { room = nanoid(), gameId } = useParams();
  const history = useHistory();
  const creationRef = useRef(false);

  React.useEffect(() => {
    const doIt = async () => {
      await fetch("/execution/test");
    };
    doIt();
  }, []);

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
        <GameSessionView gameId={gameId} room={room}>
          <BoardView namespace={gameId} editMode={editMode} />
        </GameSessionView>
      </C2CProvider>
    </Provider>
  );
};

export default ConnectedGameSessionView;
