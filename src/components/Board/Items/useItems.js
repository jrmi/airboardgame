import React from "react";
import { useC2C } from "../../../hooks/useC2C";
import { useSetRecoilState } from "recoil";

import { ItemListAtom, selectedItemsAtom } from "../";

const useItems = () => {
  const [c2c] = useC2C();

  const setItemList = useSetRecoilState(ItemListAtom);
  const setSelectItems = useSetRecoilState(selectedItemsAtom);

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

  const moveItems = React.useCallback(
    (itemIds, posDelta, sync = true) => {
      setItemList((prevList) => {
        const newItemList = prevList.map((item) => {
          if (itemIds.includes(item.id)) {
            const x = item.x + posDelta.x;
            const y = item.y + posDelta.y;
            const newItem = { ...item, x, y };
            return newItem;
          }
          return item;
        });
        if (sync) {
          c2c.publish(`selectedItemsMove`, {
            itemIds,
            posDelta,
          });
        }
        return newItemList;
      });
    },
    [setItemList, c2c]
  );

  const updateItemOrder = React.useCallback(
    (newOrder, sync = true) => {
      setItemList((prevList) => {
        const itemsMap = prevList.reduce((prev, item) => {
          prev[item.id] = item;
          return prev;
        }, {});
        const result = prevList.map((item, index) => {
          // Fix #114 crash when pushing new item and receive update list order
          // If item id doesn't exists in map, we keep the current item
          return itemsMap[newOrder[index]] || item;
        });
        if (sync) {
          c2c.publish(
            `updateItemListOrder`,
            result.map(({ id }) => id)
          );
        }
        return result;
      });
    },
    [c2c, setItemList]
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

  const swapItems = React.useCallback(
    (fromIds, toIds) => {
      setItemList((prevItemList) => {
        const swappedItems = toIds.map((toId) =>
          prevItemList.find(({ id }) => id === toId)
        );

        const updatedItems = {};
        const result = prevItemList.map((item) => {
          if (fromIds.includes(item.id)) {
            const replaceBy = swappedItems.shift();
            const newItem = {
              ...replaceBy,
              x: item.x,
              y: item.y,
            };
            updatedItems[replaceBy.id] = {
              x: item.x,
              y: item.y,
            };
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
    },
    [c2c, setItemList]
  );

  const insertItemBefore = React.useCallback(
    (newItem, beforeId, sync = true) => {
      setItemList((prevItemList) => {
        if (beforeId) {
          const insertAt = prevItemList.findIndex(({ id }) => id === beforeId);
          if (sync) {
            c2c.publish(`insertItemBefore`, [newItem, beforeId]);
          }
          const newItemList = [...prevItemList];
          newItemList.splice(insertAt, 0, {
            ...newItem,
          });
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

  const removeItems = React.useCallback(
    (itemsIdToRemove, sync = true) => {
      setItemList((prevItemList) => {
        if (sync) {
          c2c.publish(`removeItems`, itemsIdToRemove);
        }
        return prevItemList.filter(
          (item) => !itemsIdToRemove.includes(item.id)
        );
      });
      setSelectItems((prevList) => {
        return prevList.filter((id) => !itemsIdToRemove.includes(id));
      });
    },
    [c2c, setItemList, setSelectItems]
  );

  return {
    putItemsOnTop,
    batchUpdateItems,
    updateItemOrder,
    moveItems,
    updateItem,
    swapItems,
    reverseItemsOrder,
    setItemList,
    pushItem: insertItemBefore,
    removeItems,
    insertItemBefore,
  };
};

export default useItems;
