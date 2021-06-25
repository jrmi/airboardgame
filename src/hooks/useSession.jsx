import React, { useContext } from "react";
import { useSetRecoilState, useRecoilCallback } from "recoil";

import { updateSession, getSession, getGame } from "../utils/api";

import SubscribeSessionEvents from "../components/SubscribeSessionEvents";
import { useItems } from "../components/Board/Items";
import {
  AvailableItemListAtom,
  AllItemsSelector,
  BoardConfigAtom,
} from "../components/Board";
import { MessagesAtom, parseMessage } from "../components/message/useMessage";
import useBoardConfig from "../components/useBoardConfig";
import useC2C from "../components/hooks/useC2C";

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
        name: "Choississez un jeu",
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
  const { c2c } = useC2C("board");
  const { setItemList } = useItems();
  const setAvailableItemList = useSetRecoilState(AvailableItemListAtom);
  const [, setBoardConfig] = useBoardConfig();
  const setMessages = useSetRecoilState(MessagesAtom);

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
    async (newData, sync = false) => {
      const { availableItems, items, board, messages = [] } = newData;

      setAvailableItemList(availableItems);
      // The filter prevent the empty item bug on reload
      setItemList(items.filter((item) => item));
      setBoardConfig(board, false);
      setMessages(messages.map((m) => parseMessage(m)));

      if (sync) {
        // Send loadSession event for other user
        c2c.publish("loadSession", newData);
      }

      setSessionLoaded(true);
    },
    [c2c, setAvailableItemList, setBoardConfig, setItemList, setMessages]
  );

  const getCurrentSession = useRecoilCallback(
    ({ snapshot }) => async () => {
      const availableItemList = await snapshot.getPromise(
        AvailableItemListAtom
      );
      const messages = await snapshot.getPromise(MessagesAtom);
      const boardConfig = await snapshot.getPromise(BoardConfigAtom);
      const itemList = await snapshot.getPromise(AllItemsSelector);

      const currentSession = {
        items: itemList,
        board: boardConfig,
        availableItems: availableItemList,
        messages: messages.slice(-50),
        timestamp: Date.now(),
        gameId: fromGameId,
      };

      return currentSession;
    },
    [fromGameId]
  );

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
  }, [sessionId, getCurrentSession]);

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
