import React from "react";
import { useItemActions } from "react-sync-board";

import { getHeldItems, getHeldReferenceUpdates } from "../utils/item";

const useHeldItemPlacement = ({ holderRef, holderId, setState }) => {
  const { getItemList, batchUpdateItems } = useItemActions();

  return React.useCallback(
    (itemIds) => {
      let heldReferences = null;
      setState((item) => {
        const previousLinkedItems = item.linkedItems;
        const itemList = getItemList();
        const newLinkedItems = getHeldItems({
          element: holderRef.current,
          currentItemId: holderId,
          currentLinkedItemIds: previousLinkedItems,
          itemList,
          itemIds,
          shouldHoldItems: item.holdItems,
        });
        heldReferences = getHeldReferenceUpdates({
          holderId,
          linkedItems: newLinkedItems,
          itemList,
        });

        if (previousLinkedItems !== newLinkedItems) {
          return { linkedItems: newLinkedItems };
        }
      }, true);

      // Store the placement offset and angle on held items so future holder
      // rotations can preserve their exact relative positions.
      if (heldReferences && Object.keys(heldReferences).length) {
        batchUpdateItems(
          Object.keys(heldReferences),
          (heldItem) => heldReferences[heldItem.id],
          true
        );
      }
    },
    [batchUpdateItems, getItemList, holderId, holderRef, setState]
  );
};

export default useHeldItemPlacement;
