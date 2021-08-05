import React from "react";
import { useItems, useBoardConfig, useMessage } from "react-sync-board";
import useTimeout from "../hooks/useTimeout";
import useSession from "../hooks/useSession";

const GRACE_DELAY = import.meta.env.VITE_CI === "1" ? 100 : 5000;

export const AutoSaveSession = () => {
  const { saveSession, isMaster, availableItems, gameId } = useSession();
  const items = useItems();
  const [boardConfig] = useBoardConfig();
  const { messages } = useMessage();
  const timeoutRef = React.useRef(null);

  // Delay the first update to avoid too many session
  const readyRef = React.useRef(false);

  useTimeout(() => {
    readyRef.current = true;
  }, GRACE_DELAY);

  const autoSave = React.useCallback(() => {
    const currentSession = {
      items: items,
      board: boardConfig,
      availableItems: availableItems,
      messages: messages.slice(-50),
      timestamp: Date.now(),
      gameId: gameId,
    };
    saveSession(currentSession);
  }, [availableItems, boardConfig, gameId, items, messages, saveSession]);

  React.useEffect(() => {
    if (readyRef.current && isMaster) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(autoSave, GRACE_DELAY);
    }
  }, [autoSave, isMaster, items, messages, boardConfig]);

  return null;
};

export default AutoSaveSession;
