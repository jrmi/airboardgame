import React from "react";
import { useRecoilValue } from "recoil";
import { useC2C } from "../hooks/useC2C";
import debounce from "lodash.debounce";

import { updateSession } from "../utils/api";

import {
  AvailableItemListAtom,
  BoardConfigAtom,
  AllItemsSelector,
} from "./Board/";

export const AutoSaveSession = ({ session }) => {
  const [, , isMaster] = useC2C();

  const itemList = useRecoilValue(AllItemsSelector);
  const boardConfig = useRecoilValue(BoardConfigAtom);
  const availableItemList = useRecoilValue(AvailableItemListAtom);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const autoSave = React.useCallback(
    debounce(async ({ availableItemList, boardConfig, itemList }) => {
      const game = {
        items: itemList,
        board: boardConfig,
        availableItems: availableItemList,
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
    if (isMaster) {
      autoSave({ itemList, boardConfig, availableItemList });
    }
  }, [isMaster, autoSave, itemList, boardConfig, availableItemList]);

  return null;
};

export default AutoSaveSession;
