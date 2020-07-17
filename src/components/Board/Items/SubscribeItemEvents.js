import React from "react";
import { useC2C } from "../../../hooks/useC2C";
import { useSetRecoilState } from "recoil";
import { ItemListAtom } from "../";

export const SubcribeItemEvents = () => {
  const [c2c] = useC2C();
  const setItemList = useSetRecoilState(ItemListAtom);

  React.useEffect(() => {
    const unsub = c2c.subscribe(`batchItemsUpdate`, (updatedItems) => {
      setItemList((prevList) => {
        return prevList.map((item) => {
          if (item.id in updatedItems) {
            return { ...item, ...updatedItems[item.id] };
          }
          return item;
        });
      });
    });
    return unsub;
  }, [c2c, setItemList]);

  React.useEffect(() => {
    const unsub = c2c.subscribe(`selectedItemsMove`, ({ itemIds, move }) => {
      setItemList((prevList) => {
        return prevList.map((item) => {
          if (itemIds.includes(item.id)) {
            const x = item.x + move.x;
            const y = item.y + move.y;
            const newItem = { ...item, x, y };
            return newItem;
          }
          return item;
        });
      });
    });
    return unsub;
  }, [c2c, setItemList]);

  React.useEffect(() => {
    const unsub = c2c.subscribe(`updateItemListOrder`, (itemIds) => {
      setItemList((prevList) => {
        const itemsMap = prevList.reduce((prev, item) => {
          prev[item.id] = item;
          return prev;
        }, {});
        const result = prevList.map((item, index) => {
          // Fix #114 crash when pushing new item and receive update list order
          // If item id doesn't exists in map, we keep the current item
          return itemsMap[itemIds[index]] || item;
        });
        return result;
      });
    });
    return unsub;
  }, [c2c, setItemList]);

  React.useEffect(() => {
    const unsub = c2c.subscribe(`pushItem`, (newItem) => {
      setItemList((prevItemList) => [
        ...prevItemList,
        {
          ...newItem,
        },
      ]);
    });
    return unsub;
  }, [c2c, setItemList]);

  React.useEffect(() => {
    const unsub = c2c.subscribe(`insertItemBefore`, ([newItem, beforeId]) => {
      setItemList((prevItemList) => {
        if (beforeId) {
          const insertAt = prevItemList.findIndex(({ id }) => id === beforeId);
          const newItemList = [...prevItemList];
          newItemList.splice(insertAt, 0, { ...newItem });
          return newItemList;
        } else {
          return [
            ...prevItemList,
            {
              ...newItem,
            },
          ];
        }
      });
    });
    return unsub;
  }, [c2c, setItemList]);

  React.useEffect(() => {
    const unsub = c2c.subscribe(`removeItem`, (itemId) => {
      setItemList((prevItemList) =>
        prevItemList.filter((item) => item.id !== itemId)
      );
    });
    return unsub;
  }, [c2c, setItemList]);

  return null;
};

export default SubcribeItemEvents;
