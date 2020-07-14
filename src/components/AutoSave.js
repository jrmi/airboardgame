import React from "react";
import { useRecoilValue } from "recoil";

import useGameStorage from "./Board/game/useGameStorage";

import { AvailableItemListAtom, BoardConfigAtom, ItemListAtom } from "./Board/";

import throttle from "lodash.throttle";

export const AutoSave = () => {
  const availableItemList = useRecoilValue(AvailableItemListAtom);
  const boardConfig = useRecoilValue(BoardConfigAtom);
  const itemList = useRecoilValue(ItemListAtom);

  const [, setGameLocalSave] = useGameStorage();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateAutoSave = React.useCallback(
    throttle(
      (game) => {
        if (game.items.length) {
          setGameLocalSave(game);
        }
      },
      5000,
      { trailing: true }
    ),
    []
  );

  React.useEffect(() => {
    updateAutoSave({
      items: itemList,
      board: boardConfig,
      availableItems: availableItemList,
    });
  }, [itemList, boardConfig, availableItemList, updateAutoSave]);

  return null;
};

export default AutoSave;
