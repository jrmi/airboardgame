import React from "react";
import { useC2C } from "../../../hooks/useC2C";
import useItems from "./useItems";

export const SubcribeItemEvents = () => {
  const [c2c] = useC2C();

  const {
    updateItemOrder,
    moveItems,
    setItemList,
    removeItems,
    insertItemBefore,
  } = useItems();

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
    const unsub = c2c.subscribe(
      `selectedItemsMove`,
      ({ itemIds, posDelta }) => {
        moveItems(itemIds, posDelta, false);
      }
    );
    return unsub;
  }, [c2c, moveItems]);

  React.useEffect(() => {
    const unsub = c2c.subscribe(`updateItemListOrder`, (itemIds) => {
      updateItemOrder(itemIds, false);
    });
    return unsub;
  }, [c2c, updateItemOrder]);

  React.useEffect(() => {
    const unsub = c2c.subscribe(`pushItem`, (newItem) => {
      insertItemBefore(newItem, null, false);
    });
    return unsub;
  }, [c2c, insertItemBefore]);

  React.useEffect(() => {
    const unsub = c2c.subscribe(`insertItemBefore`, ([newItem, beforeId]) => {
      insertItemBefore(newItem, beforeId, false);
    });
    return unsub;
  }, [c2c, insertItemBefore]);

  React.useEffect(() => {
    const unsub = c2c.subscribe(`removeItems`, (itemIds) => {
      removeItems(itemIds, false);
    });
    return unsub;
  }, [c2c, removeItems]);

  return null;
};

export default SubcribeItemEvents;
