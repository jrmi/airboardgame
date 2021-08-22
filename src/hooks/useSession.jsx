import React, { useContext } from "react";
import {
  useItemActions,
  useMessage,
  useBoardConfig,
  useC2C,
} from "react-sync-board";

import SubscribeSessionEvents from "./SubscribeSessionEvents";

import { updateSession, getSession, getGame } from "../utils/api";

export const SessionContext = React.createContext({});

const emtpyBoard = {
  items: [],
  availableItems: [],
  board: {
    size: 1000,
    scale: 1,
    translations: [
      {
        language: "fr",
        name: "Choisissez un jeu",
        description: "...",
      },
    ],
    defaultName: "Choose a game",
    defaultLanguage: "en",
    defaultDescription: "...",
    gridSize: 1,
  },
};

export const SessionProvider = ({ sessionId, fromGameId, children }) => {
  const { setItemList, getItemList } = useItemActions();
  const { messages, setMessages } = useMessage();
  const [availableItems, setAvailableItems] = React.useState([]);
  const [boardConfig, setBoardConfig] = useBoardConfig();

  const [sessionLoaded, setSessionLoaded] = React.useState(false);
  const [currentGameId, setCurrentGameId] = React.useState(fromGameId);

  const { c2c } = useC2C("board");

  const loadSession = React.useCallback(async () => {
    let sessionData;

    // Init session from server
    try {
      // First from session if exists
      sessionData = await getSession(sessionId);
      const sessionGameId = sessionData.gameId;

      // Update availableItems from original game
      if (sessionGameId) {
        const { availableItems } = await getGame(sessionGameId);
        sessionData.availableItems = availableItems;
        setCurrentGameId(sessionGameId);
      }
    } catch {
      if (fromGameId) {
        // Then from initial game
        sessionData = await getGame(fromGameId);
      } else {
        // Empty board
        sessionData = emtpyBoard;
      }
    }
    return sessionData;
  }, [fromGameId, sessionId]);

  const setSession = React.useCallback(
    async (newData, sync = false) => {
      const { availableItems, items, board, messages = [] } = newData;
      setAvailableItems(availableItems);
      // The filter prevents the empty item bug or missing type on reload
      setItemList(items.filter((item) => item && item.type));
      setBoardConfig(board, false);
      setMessages(messages);

      if (sync) {
        // Send loadSession event for other user
        c2c.publish("loadSession", newData);
      }

      setSessionLoaded(true);
    },
    [c2c, setBoardConfig, setItemList, setMessages]
  );

  const getCurrentSession = React.useCallback(async () => {
    const currentSession = {
      items: await getItemList(),
      board: boardConfig,
      availableItems: availableItems,
      messages: messages.slice(-50),
      timestamp: Date.now(),
      gameId: fromGameId,
    };

    return currentSession;
  }, [availableItems, boardConfig, fromGameId, getItemList, messages]);

  const changeGame = React.useCallback(
    async (newGameId) => {
      const newGame = await getGame(newGameId);
      const currentSession = getCurrentSession();

      setSession({ ...currentSession, ...newGame }, true);
    },
    [getCurrentSession, setSession]
  );

  const saveSession = React.useCallback(async () => {
    const currentSession = await getCurrentSession();

    if (currentSession.items.length) {
      try {
        return await updateSession(sessionId, currentSession);
      } catch (e) {
        console.log(e);
      }
    }
  }, [getCurrentSession, sessionId]);

  return (
    <SessionContext.Provider
      value={{
        loadSession,
        changeGame,
        setSession,
        getSession: getCurrentSession,
        saveSession,
        sessionLoaded,
        sessionId,
        gameId: currentGameId,
        availableItems,
        boardConfig,
        messages,
      }}
    >
      {children}
      <SubscribeSessionEvents
        getSession={getCurrentSession}
        setSession={setSession}
      />
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  return useContext(SessionContext);
};

export default useSession;
