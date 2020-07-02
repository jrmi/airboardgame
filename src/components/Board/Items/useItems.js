import React from "react";
import { useC2C } from "../../../hooks/useC2C";
import { useRecoilState, useRecoilValue } from "recoil";
import { selectedItemsAtom } from "../Selector";
import { shuffle as shuffleArray } from "../../../utils";

import { ItemListAtom } from "../game/atoms";

const useItemsAction = () => {
  const [c2c] = useC2C();
  const [itemList, setItemList] = useRecoilState(ItemListAtom);
  const selectedItems = useRecoilValue(selectedItemsAtom);

  const batchUpdateItems = React.useCallback(
    (ids, callbackOrItem, sync = true) => {
      let callback = callbackOrItem;
      if (typeof callbackOrItem === "object") {
        callback = () => callbackOrItem;
      }
      setItemList((prevList) => {
        return prevList.map((item) => {
          if (ids.includes(item.id)) {
            const newItem = {
              ...callback(item),
              id: item.id,
            };
            if (sync) {
              c2c.publish(`itemStateUpdate.${newItem.id}`, newItem);
            }
            return newItem;
          }
          return item;
        });
      });
    },
    [c2c, setItemList]
  );

  const updateItem = React.useCallback(
    (id, callbackOrItem, sync = true) => {
      batchUpdateItems([id], callbackOrItem, sync);
    },
    [batchUpdateItems]
  );

  const moveSelectedItems = React.useCallback(
    (itemId, posDelta) => {
      let ids = [itemId];
      if (selectedItems.includes(itemId)) {
        ids = selectedItems;
      }
      setItemList((prevList) => {
        const newItemList = prevList.map((item) => {
          if (ids.includes(item.id)) {
            const x = item.x + posDelta.x;
            const y = item.y + posDelta.y;
            const newItem = { ...item, x, y };
            return newItem;
          }
          return item;
        });
        c2c.publish(`selectedItemsMove`, {
          itemIds: ids,
          move: posDelta,
        });
        return newItemList;
      });
    },
    [setItemList, selectedItems, c2c]
  );

  const putItemsOnTop = React.useCallback(
    (itemIdsToMove) => {
      setItemList((prevItemList) => {
        const itemsToMove = prevItemList.filter(({ id }) =>
          itemIdsToMove.includes(id)
        );
        const result = [
          ...prevItemList.filter(({ id }) => !itemIdsToMove.includes(id)),
          ...itemsToMove,
        ];
        console.log(result);
        c2c.publish(
          `updateItemListOrder`,
          result.map(({ id }) => id)
        );
        return result;
      });
    },
    [setItemList, c2c]
  );

  // Shuffle selection
  const shuffleSelectedItems = React.useCallback(() => {
    setItemList((prevItemList) => {
      const shuffledSelectedItems = shuffleArray(
        prevItemList.filter(({ id }) => selectedItems.includes(id))
      );

      const result = prevItemList.map((item) => {
        if (selectedItems.includes(item.id)) {
          const newItem = {
            ...shuffledSelectedItems.pop(),
            x: item.x,
            y: item.y,
          };
          c2c.publish(`itemStateUpdate.${newItem.id}`, newItem);
          return newItem;
        }
        return item;
      });

      c2c.publish(
        `updateItemListOrder`,
        result.map(({ id }) => id)
      );
      return result;
    });
  }, [c2c, setItemList, selectedItems]);

  const pushItem = React.useCallback(
    (newItem) => {
      setItemList((prevItemList) => {
        c2c.publish(`pushItem`, newItem);
        return [
          ...prevItemList,
          {
            ...newItem,
          },
        ];
      });
    },
    [c2c, setItemList]
  );

  const removeItem = React.useCallback(
    (itemId) => {
      setItemList((prevItemList) => {
        c2c.publish(`removeItem`, itemId);
        return prevItemList.filter((item) => item.id !== itemId);
      });
    },
    [c2c, setItemList]
  );

  return {
    itemList,
    putItemsOnTop,
    batchUpdateItems,
    moveSelectedItems,
    updateItem,
    shuffleSelectedItems,
    setItemList,
    pushItem,
    removeItem,
  };
};

export default useItemsAction;
