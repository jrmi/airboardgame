import React from "react";
import { useC2C } from "../../../hooks/useC2C";
import { useSetRecoilState, useRecoilCallback } from "recoil";

import { ItemListAtom, selectedItemsAtom, ItemMapAtom } from "../";

const useItems = () => {
  const [c2c] = useC2C();

  const setItemList = useSetRecoilState(ItemListAtom);
  const setItemMap = useSetRecoilState(ItemMapAtom);
  const setSelectItems = useSetRecoilState(selectedItemsAtom);

  const batchUpdateItems = useRecoilCallback(
    ({ snapshot }) => async (itemIds, callbackOrItem, sync = true) => {
      let callback = callbackOrItem;
      if (typeof callbackOrItem === "object") {
        callback = () => callbackOrItem;
      }
      const itemList = await snapshot.getPromise(ItemListAtom);

      const orderedItemIds = itemList.filter((id) => itemIds.includes(id));

      setItemMap((prevItemMap) => {
        const result = { ...prevItemMap };
        const updatedItems = {};
        orderedItemIds.forEach((id) => {
          const newItem = { ...callback(prevItemMap[id]) };
          result[id] = newItem;
          updatedItems[id] = newItem;
        });
        if (sync) {
          c2c.publish(`batchItemsUpdate`, updatedItems);
        }
        return result;
      });
    },
    [c2c, setItemMap]
  );

  const setItemListFull = React.useCallback(
    (items) => {
      setItemMap(
        items.reduce((acc, item) => {
          if (item && item.id) {
            acc[item.id] = item;
          }
          return acc;
        }, {})
      );
      setItemList(items.map(({ id }) => id));
    },
    [setItemList, setItemMap]
  );

  const updateItem = React.useCallback(
    (id, callbackOrItem, sync = true) => {
      batchUpdateItems([id], callbackOrItem, sync);
    },
    [batchUpdateItems]
  );

  const moveItems = React.useCallback(
    (itemIds, posDelta, sync = true) => {
      setItemMap((prevItemMap) => {
        const result = { ...prevItemMap };
        itemIds.forEach((id) => {
          const item = prevItemMap[id];
          result[id] = {
            ...item,
            x: item.x + posDelta.x,
            y: item.y + posDelta.y,
          };
        });
        return result;
      });

      if (sync) {
        c2c.publish(`selectedItemsMove`, {
          itemIds,
          posDelta,
        });
      }
    },
    [c2c, setItemMap]
  );

  const updateItemOrder = React.useCallback(
    (newOrder, sync = true) => {
      setItemList(newOrder);
      if (sync) {
        c2c.publish(`updateItemListOrder`, newOrder);
      }
    },
    [c2c, setItemList]
  );

  const putItemsOnTop = React.useCallback(
    (itemIdsToMove) => {
      setItemList((prevItemList) => {
        const filtered = prevItemList.filter(
          (id) => !itemIdsToMove.includes(id)
        );
        const toBePutOnTop = prevItemList.filter((id) =>
          itemIdsToMove.includes(id)
        );
        const result = [...filtered, ...toBePutOnTop];
        c2c.publish(`updateItemListOrder`, result);
        return result;
      });
    },
    [setItemList, c2c]
  );

  const reverseItemsOrder = React.useCallback(
    (itemIdsToReverse) => {
      setItemList((prevItemList) => {
        const toBeReversed = prevItemList.filter((id) =>
          itemIdsToReverse.includes(id)
        );
        const result = prevItemList.map((itemId) => {
          if (itemIdsToReverse.includes(itemId)) {
            return toBeReversed.pop();
          }
          return itemId;
        });
        c2c.publish(`updateItemListOrder`, result);
        return result;
      });
    },
    [setItemList, c2c]
  );

  const swapItems = useRecoilCallback(
    ({ snapshot }) => async (fromIds, toIds) => {
      const itemMap = await snapshot.getPromise(ItemMapAtom);
      const fromItems = fromIds.map((id) => itemMap[id]);
      const toItems = toIds.map((id) => itemMap[id]);

      const replaceMapItems = toIds.reduce((theMap, id) => {
        theMap[id] = fromItems.shift();
        return theMap;
      }, {});

      setItemMap((prevItemMap) => {
        const updatedItems = toItems.reduce((prev, toItem) => {
          const replaceBy = replaceMapItems[toItem.id];
          const newItem = {
            ...toItem,
            x: replaceBy.x,
            y: replaceBy.y,
          };
          prev[toItem.id] = newItem;
          return prev;
        }, {});
        c2c.publish(`batchItemsUpdate`, updatedItems);
        return { ...prevItemMap, ...updatedItems };
      });

      const replaceMap = fromIds.reduce((theMap, id) => {
        theMap[id] = toIds.shift();
        return theMap;
      }, {});

      setItemList((prevItemList) => {
        const result = prevItemList.map((itemId) => {
          if (fromIds.includes(itemId)) {
            return replaceMap[itemId];
          }
          return itemId;
        });

        c2c.publish(`updateItemListOrder`, result);
        return result;
      });
    },
    [c2c, setItemList, setItemMap]
  );

  const insertItemBefore = useRecoilCallback(
    () => (newItem, beforeId, sync = true) => {
      setItemMap((prevItemMap) => ({
        ...prevItemMap,
        [newItem.id]: newItem,
      }));

      setItemList((prevItemList) => {
        if (beforeId) {
          const insertAt = prevItemList.findIndex((id) => id === beforeId);

          const newItemList = [...prevItemList];
          newItemList.splice(insertAt, 0, newItem.id);
          return newItemList;
        } else {
          return [...prevItemList, newItem.id];
        }
      });
      if (sync) {
        c2c.publish(`insertItemBefore`, [newItem, beforeId]);
      }
    },
    [c2c, setItemList, setItemMap]
  );

  const removeItems = React.useCallback(
    (itemsIdToRemove, sync = true) => {
      // Remove from selected items first
      setSelectItems((prevList) => {
        return prevList.filter((id) => !itemsIdToRemove.includes(id));
      });

      setItemList((prevItemList) => {
        return prevItemList.filter(
          (itemId) => !itemsIdToRemove.includes(itemId)
        );
      });

      setItemMap((prevItemMap) => {
        const result = { ...prevItemMap };
        itemsIdToRemove.forEach((id) => {
          delete result[id];
        });
        return result;
      });

      if (sync) {
        c2c.publish(`removeItems`, itemsIdToRemove);
      }
    },
    [c2c, setItemList, setItemMap, setSelectItems]
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
