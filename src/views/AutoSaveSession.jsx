import React from "react";
import { useRecoilValue } from "recoil";
import { useC2C } from "react-sync-board";
import { MessagesAtom } from "../components/message/useMessage";
import useTimeout from "../hooks/useTimeout";
import useSession from "../hooks/useSession";
import debounce from "lodash.debounce";

import {
  AvailableItemListAtom,
  BoardConfigAtom,
  AllItemsSelector,
} from "../components/board";

const GRACE_DELAY = import.meta.env.VITE_CI ? 100 : 5000;

export const AutoSaveSession = () => {
  const { isMaster } = useC2C("board");

  const { saveSession } = useSession();

  // Delay the first update to avoid too many session
  const readyRef = React.useRef(false);

  useTimeout(() => {
    readyRef.current = true;
  }, GRACE_DELAY);

  const messages = useRecoilValue(MessagesAtom);
  const itemList = useRecoilValue(AllItemsSelector);
  const boardConfig = useRecoilValue(BoardConfigAtom);
  const availableItemList = useRecoilValue(AvailableItemListAtom);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const autoSave = React.useCallback(debounce(saveSession, 1000), [
    saveSession,
  ]);

  React.useEffect(() => {
    if (isMaster && readyRef.current) {
      autoSave();
    }
  }, [isMaster, autoSave, itemList, boardConfig, availableItemList, messages]);

  return null;
};

export default AutoSaveSession;
