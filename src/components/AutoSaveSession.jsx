import React from "react";
import { useRecoilValue } from "recoil";
import { useC2C } from "../hooks/useC2C";
import { MessagesAtom } from "../hooks/useMessage";
import useTimeout from "../hooks/useTimeout";
import debounce from "lodash.debounce";

import { updateSession } from "../utils/api";

import {
  AvailableItemListAtom,
  BoardConfigAtom,
  AllItemsSelector,
} from "./Board/";

export const AutoSaveSession = ({ session }) => {
  const { isMaster } = useC2C();

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
  const autoSave = React.useCallback(
    debounce(async ({ availableItemList, boardConfig, itemList, messages }) => {
      const game = {
        items: itemList,
        board: boardConfig,
        availableItems: availableItemList,
        messages: messages.slice(-50),
        timestamp: Date.now(),
      };

      if (game.items.length) {
        try {
          await updateSession(session, game);
        } catch (e) {
          console.log(e);
        }
      }
    }, 1000),
    [session]
  );

  React.useEffect(() => {
    if (isMaster && readyRef.current) {
      autoSave({ itemList, boardConfig, availableItemList, messages });
    }
  }, [isMaster, autoSave, itemList, boardConfig, availableItemList, messages]);

  return null;
};

export default AutoSaveSession;
