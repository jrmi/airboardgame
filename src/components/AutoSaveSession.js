import React from "react";
import { useRecoilCallback } from "recoil";
import { useC2C } from "../hooks/useC2C";

import { updateSession } from "../utils/api";

import {
  AvailableItemListAtom,
  BoardConfigAtom,
  AllItemsSelector,
} from "./Board/";

export const AutoSaveSession = ({ session }) => {
  const [, , isMaster] = useC2C();

  const updateAutoSave = useRecoilCallback(
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
        timestamp: Date.now(),
      };

      if (game.items.length) {
        try {
          await updateSession(session, game);
        } catch (e) {
          console.log(e);
        }
      }
    },
    [session]
  );

  React.useEffect(() => {
    let mounted = true;

    const cancel = setInterval(() => {
      if (!mounted || !isMaster) return;
      updateAutoSave();
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(cancel);
    };
  }, [isMaster, updateAutoSave]);

  return null;
};

export default AutoSaveSession;
