import React from "react";
import { useRecoilValue } from "recoil";
import { useC2C } from "../hooks/useC2C";
import { MessagesAtom } from "../hooks/useMessage";
import useTimeout from "../hooks/useTimeout";
import useSession from "../hooks/useSession";
import debounce from "lodash.debounce";

import {
  AvailableItemListAtom,
  BoardConfigAtom,
  AllItemsSelector,
} from "./Board/";

export const AutoSaveSession = () => {
  const { isMaster } = useC2C();

  const { saveSession } = useSession();

  // Delay the first update to avoid too many session
  const readyRef = React.useRef(false);
  useTimeout(() => {
    readyRef.current = true;
  }, 5000);

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
