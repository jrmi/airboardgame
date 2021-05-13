import React, { useContext } from "react";
import { useSetRecoilState, useRecoilCallback } from "recoil";

import { updateSession } from "../utils/api";

import SubscribeSessionEvents from "../components/SubscribeSessionEvents";
import { useItems } from "../components/Board/Items";
import {
  AvailableItemListAtom,
  AllItemsSelector,
  BoardConfigAtom,
} from "../components/Board";
import { MessagesAtom } from "../hooks/useMessage";
import useBoardConfig from "../components/useBoardConfig";

export const SessionContext = React.createContext({});

export const SessionProvider = ({
  sessionId,
  session,
  fromGameId,
  children,
}) => {
  const { setItemList } = useItems();
  const setAvailableItemList = useSetRecoilState(AvailableItemListAtom);
  const [, setBoardConfig] = useBoardConfig();

  const [sessionLoaded, setSessionLoaded] = React.useState(false);

  const setSession = React.useCallback(
    async (newData) => {
      setAvailableItemList(newData.availableItems);
      // The filter prevent the empty item bug on reload
      setItemList(newData.items.filter((item) => item));
      setBoardConfig(newData.board, false);
      setSessionLoaded(true);
    },
    [setAvailableItemList, setBoardConfig, setItemList]
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

  React.useEffect(() => {
    if (session) {
      setSession(session);
    }
  }, [session, setSession]);

  return (
    <SessionContext.Provider
      value={{
        setSession,
        getSession: getCurrentSession,
        saveSession,
        sessionLoaded,
        sessionId,
      }}
    >
      {sessionLoaded && children}
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
