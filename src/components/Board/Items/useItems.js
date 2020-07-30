import React from "react";
import { useC2C } from "../../../hooks/useC2C";
import { useSetRecoilState, useRecoilCallback } from "recoil";

import { ItemListAtom, selectedItemsAtom, ItemsFamily } from "../";

const useItems = () => {
  const [c2c] = useC2C();

  const setItemList = useSetRecoilState(ItemListAtom);
  const setSelectItems = useSetRecoilState(selectedItemsAtom);

  const batchUpdateItems = useRecoilCallback(
    ({ set }) => (itemIds, callbackOrItem, sync = true) => {
      let callback = callbackOrItem;
      if (typeof callbackOrItem === "object") {
        callback = () => callbackOrItem;
      }
      const updatedItems = {};
      itemIds.forEach((id) => {
        set(ItemsFamily(id), (item) => {
          const newItem = {
            ...callback(item),
            id: item.id,
          };
          updatedItems[item.id] = newItem;
          return newItem;
        });
      });
      if (sync) {
        c2c.publish(`batchItemsUpdate`, updatedItems);
      }
    },
    [c2c]
  );

  const setItemListFull = useRecoilCallback(
    ({ set }) => (items) => {
      setItemList(
        items.map(({ id }) => ({
          id,
        }))
      );
      items.forEach((item) => {
        set(ItemsFamily(item.id), item);
      });
    },
    [setItemList]
  );

  const updateItem = React.useCallback(
    (id, callbackOrItem, sync = true) => {
      batchUpdateItems([id], callbackOrItem, sync);
    },
    [batchUpdateItems]
  );

  const moveItems = useRecoilCallback(
    ({ set }) => async (itemIds, posDelta, sync = true) => {
      itemIds.forEach((id) => {
        set(ItemsFamily(id), (item) => ({
          ...item,
          x: item.x + posDelta.x,
          y: item.y + posDelta.y,
        }));
      });
      if (sync) {
        c2c.publish(`selectedItemsMove`, {
          itemIds,
          posDelta,
        });
      }
    },
    [c2c]
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

  const swapItems = useRecoilCallback(
    ({ snapshot, set }) => async (fromIds, toIds) => {
      const fromItems = await Promise.all(
        fromIds.map((id) => snapshot.getPromise(ItemsFamily(id)))
      );
      const toItems = await Promise.all(
        toIds.map((id) => snapshot.getPromise(ItemsFamily(id)))
      );

      const replaceMapItems = toIds.reduce((theMap, id) => {
        theMap[id] = fromItems.shift();
        return theMap;
      }, {});

      const updatedItems = toItems.reduce((prev, toItem) => {
        const replaceBy = replaceMapItems[toItem.id];
        const newItem = {
          ...toItem,
          x: replaceBy.x,
          y: replaceBy.y,
        };
        set(ItemsFamily(toItem.id), newItem);
        prev[toItem.id] = newItem;
        return prev;
      }, {});

      c2c.publish(`batchItemsUpdate`, updatedItems);

      const replaceMap = fromIds.reduce((theMap, id) => {
        theMap[id] = toIds.shift();
        return theMap;
      }, {});

      setItemList((prevItemList) => {
        const result = prevItemList.map((item) => {
          if (fromIds.includes(item.id)) {
            return {
              id: replaceMap[item.id],
            };
          }
          return item;
        });

        c2c.publish(
          `updateItemListOrder`,
          result.map(({ id }) => id)
        );
        return result;
      });
    }
  );

  const insertItemBefore = useRecoilCallback(
    ({ set }) => (newItem, beforeId, sync = true) => {
      set(ItemsFamily(newItem.id), newItem);
      setItemList((prevItemList) => {
        if (beforeId) {
          const insertAt = prevItemList.findIndex(({ id }) => id === beforeId);

          const newItemList = [...prevItemList];
          newItemList.splice(insertAt, 0, {
            id: newItem.id,
          });
          return newItemList;
        } else {
          return [
            ...prevItemList,
            {
              id: newItem.id,
            },
          ];
        }
      });
      if (sync) {
        c2c.publish(`insertItemBefore`, [newItem, beforeId]);
      }
    },
    [c2c, setItemList]
  );

  const removeItems = useRecoilCallback(
    ({ set }) => (itemsIdToRemove, sync = true) => {
      setItemList((prevItemList) => {
        return prevItemList.filter(
          (item) => !itemsIdToRemove.includes(item.id)
        );
      });
      itemsIdToRemove.forEach((id) => set(ItemsFamily(id), undefined));
      if (sync) {
        c2c.publish(`removeItems`, itemsIdToRemove);
      }
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
    setItemList: setItemListFull,
    pushItem: insertItemBefore,
    removeItems,
    insertItemBefore,
  };
};

export default useItems;
