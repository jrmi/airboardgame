import React from "react";
import { useC2C } from "../../../hooks/useC2C";
import useItems from "./useItems";
import { useRecoilCallback } from "recoil";

import { ItemsFamily } from "../";

export const SubcribeItemEvents = () => {
  const [c2c] = useC2C();

  const {
    updateItemOrder,
    moveItems,
    removeItems,
    insertItemBefore,
  } = useItems();

  const batchUpdate = useRecoilCallback(
    ({ set }) => (updatedItems) => {
      for (const [id, newItem] of Object.entries(updatedItems)) {
        set(ItemsFamily(id), (item) => ({ ...item, ...newItem }));
      }
    },
    []
  );

  React.useEffect(() => {
    const unsub = c2c.subscribe(`batchItemsUpdate`, (updatedItems) => {
      batchUpdate(updatedItems);
    });
    return unsub;
  }, [c2c, batchUpdate]);

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
