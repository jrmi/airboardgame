import React from "react";
import { useC2C } from "../../../hooks/useC2C";
import { useSetRecoilState } from "recoil";
import ItemListAtom from "./atoms";

export const SubcribeItemEvents = () => {
  const [c2c] = useC2C();
  const setItemList = useSetRecoilState(ItemListAtom);

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
          return itemsMap[itemIds[index]];
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
