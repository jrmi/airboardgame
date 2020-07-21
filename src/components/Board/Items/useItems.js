import React from "react";
import { useC2C } from "../../../hooks/useC2C";
import { useSetRecoilState, useRecoilState } from "recoil";
import { shuffle as shuffleArray } from "../../../utils";

import { ItemListAtom, selectedItemsAtom } from "../";

const useItems = () => {
  const [c2c] = useC2C();

  const setItemList = useSetRecoilState(ItemListAtom);
  const [selectedItems, setSelectItems] = useRecoilState(selectedItemsAtom);

  const batchUpdateItems = React.useCallback(
    (ids, callbackOrItem, sync = true) => {
      let callback = callbackOrItem;
      if (typeof callbackOrItem === "object") {
        callback = () => callbackOrItem;
      }
      setItemList((prevList) => {
        const updatedItems = {};
        const updatedList = prevList.map((item) => {
          if (ids.includes(item.id)) {
            const newItem = {
              ...callback(item),
              id: item.id,
            };
            updatedItems[newItem.id] = newItem;
            return newItem;
          }
          return item;
        });
        if (sync) {
          c2c.publish(`batchItemsUpdate`, updatedItems);
        }
        return updatedList;
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
        c2c.publish(
          `updateItemListOrder`,
          result.map(({ id }) => id)
        );
        return result;
      });
    },
    [setItemList, c2c]
  );

  const reverseItemsOrder = React.useCallback(
    (itemIdsToReverse) => {
      setItemList((prevItemList) => {
        const itemsToReverse = prevItemList.filter(({ id }) =>
          itemIdsToReverse.includes(id)
        );
        const result = prevItemList.map((item) => {
          if (itemIdsToReverse.includes(item.id)) {
            return itemsToReverse.pop();
          }
          return item;
        });
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
      const updatedItems = {};
      const result = prevItemList.map((item) => {
        if (selectedItems.includes(item.id)) {
          const replaceBy = shuffledSelectedItems.pop();
          const newItem = {
            ...replaceBy,
            x: item.x,
            y: item.y,
          };
          updatedItems[replaceBy.id] = { x: item.x, y: item.y };
          return newItem;
        }
        return item;
      });

      c2c.publish(`batchItemsUpdate`, updatedItems);

      c2c.publish(
        `updateItemListOrder`,
        result.map(({ id }) => id)
      );
      return result;
    });
  }, [c2c, setItemList, selectedItems]);

  const insertItemBefore = React.useCallback(
    (newItem, beforeId, sync = true) => {
      setItemList((prevItemList) => {
        if (beforeId) {
          const insertAt = prevItemList.findIndex(({ id }) => id === beforeId);
          if (sync) {
            c2c.publish(`insertItemBefore`, [newItem, beforeId]);
          }
          const newItemList = [...prevItemList];
          newItemList.splice(insertAt, 0, { ...newItem });
          return newItemList;
        } else {
          if (sync) {
            c2c.publish(`insertItemBefore`, [newItem]);
          }
          return [
            ...prevItemList,
            {
              ...newItem,
            },
          ];
        }
      });
    },
    [c2c, setItemList]
  );

  const pushItem = React.useCallback(
    (newItem) => {
      insertItemBefore(newItem);
    },
    [insertItemBefore]
  );

  const removeItem = React.useCallback(
    (itemIdToRemove) => {
      if (selectedItems.includes(itemIdToRemove)) {
        setSelectItems((prev) => [
          ...prev.filter((id) => id !== itemIdToRemove),
        ]);
      }
      setItemList((prevItemList) => {
        c2c.publish(`removeItem`, itemIdToRemove);
        return prevItemList.filter((item) => item.id !== itemIdToRemove);
      });
    },
    [c2c, selectedItems, setItemList, setSelectItems]
  );

  return {
    putItemsOnTop,
    batchUpdateItems,
    moveSelectedItems,
    updateItem,
    shuffleSelectedItems,
    reverseItemsOrder,
    setItemList,
    pushItem,
    removeItem,
    insertItemBefore,
  };
};

export default useItems;
