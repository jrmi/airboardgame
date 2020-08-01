import React from "react";
import { useRecoilCallback } from "recoil";

import useGameStorage from "./Board/game/useGameStorage";

import {
  AvailableItemListAtom,
  BoardConfigAtom,
  AllItemsSelector,
} from "./Board/";

export const AutoSave = () => {
  const [, setGameLocalSave] = useGameStorage();

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
      };
      if (game.items.length) {
        setGameLocalSave(game);
      }
    },
    [setGameLocalSave]
  );

  React.useEffect(() => {
    let mounted = true;

    const cancel = setInterval(() => {
      if (!mounted) return;
      updateAutoSave();
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(cancel);
    };
  }, [updateAutoSave]);

  return null;
};

export default AutoSave;
