import { debounce } from "lodash";
import React, { useContext } from "react";

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
  const [initialItems, setInitialItems] = React.useState([]);
  const [availableItems, setAvailableItems] = React.useState([]);
  const [messages, setMessages] = React.useState([]);
  const [boardConfig, setBoardConfig] = React.useState({});
  const [currentItems, setCurrentItems] = React.useState([]);
  const [isMaster, setIsMaster] = React.useState(null);

  const [sessionLoaded, setSessionLoaded] = React.useState(false);
  const [currentGameId, setCurrentGameId] = React.useState(fromGameId);

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
    async (newData) => {
      const { availableItems, items, board, messages = [] } = newData;

      setAvailableItems(availableItems);
      // The filter prevent the empty item bug on reload
      setInitialItems(items.filter((item) => item));
      setBoardConfig(board);
      setMessages(messages);
      setSessionLoaded(true);
    },
    [setMessages]
  );

  /*const getCurrentSession = React.useCallback(() => {
    const currentSession = {
      items: currentItems,
      board: boardConfig,
      availableItems: availableItems,
      messages: messages.slice(-50),
      timestamp: Date.now(),
      gameId: fromGameId,
    };

    return currentSession;
  }, [availableItems, boardConfig, currentItems, fromGameId, messages]);*/

  const changeGame = React.useCallback(async (newGameId) => {
    const newGame = await getGame(newGameId);

    setAvailableItems(newGame.availableItems);
    // The filter prevent the empty item bug on reload
    setInitialItems(newGame.items.filter((item) => item));
    setBoardConfig(newGame.board);
    //const currentSession = getCurrentSession();

    //setSession({ ...currentSession, ...newGame });
  }, []);

  const saveSession = React.useCallback(
    async (currentSession) => {
      //const currentSession = await getCurrentSession();

      if (currentSession.items.length) {
        try {
          return await updateSession(sessionId, currentSession);
        } catch (e) {
          console.log(e);
        }
      }
    },
    [sessionId]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetCurrentItems = React.useCallback(
    debounce(setCurrentItems, 500),
    []
  );

  return (
    <SessionContext.Provider
      value={{
        loadSession,
        changeGame,
        setSession,
        // getSession: getCurrentSession,
        saveSession,
        sessionLoaded,
        sessionId,
        gameId: currentGameId,
        initialItems,
        availableItems,
        boardConfig,
        messages,
        setCurrentItems: debouncedSetCurrentItems,
        currentItems,
        isMaster,
        initialMessages: messages,
        setIsMaster,
      }}
    >
      {children}
      {/*<SubscribeSessionEvents
        getSession={getCurrentSession}
        setSession={setSession}
      />*/}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  return useContext(SessionContext);
};

export default useSession;
