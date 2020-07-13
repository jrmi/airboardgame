import React from "react";

import { useRecoilValue, useRecoilCallback } from "recoil";
import { useItems } from "./";
import { selectedItemsAtom } from "../Selector";

import { useUsers } from "../../users";

import intersection from "lodash.intersection";
import { ItemListAtom } from "../";
import { getDefaultActionsFromItem } from "./Item/allItems";

const getActionsFromItem = (item) => {
  const defaultActions = getDefaultActionsFromItem(item);
  const { actions = [] } = item;
  return defaultActions.concat(actions);
};

export const useItemActions = () => {
  const {
    batchUpdateItems,
    removeItem,
    reverseItemsOrder,
    shuffleSelectedItems,
  } = useItems();

  const { currentUser } = useUsers();

  const selectedItems = useRecoilValue(selectedItemsAtom);
  const [availableActions, setAvailableActions] = React.useState([]);
  const isMountedRef = React.useRef(false);

  const getSelectedItemList = React.useCallback(
    async (snapshot) => {
      const itemList = await snapshot.getPromise(ItemListAtom);
      return itemList.filter(({ id }) => selectedItems.includes(id));
    },
    [selectedItems]
  );

  React.useEffect(() => {
    // Mounted guard
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const updateAvailableActions = useRecoilCallback(
    async (snapshot) => {
      if (selectedItems.length > 0) {
        const selectedItemList = await getSelectedItemList(snapshot);

        // Prevent set state on unmounted component
        if (!isMountedRef.current) return;
        setAvailableActions(
          selectedItemList.reduce((acc, item) => {
            return intersection(acc, getActionsFromItem(item));
          }, getActionsFromItem(selectedItemList[0]))
        );
      } else {
        setAvailableActions([]);
      }
    },
    [selectedItems]
  );

  // Update available actions when selection change
  React.useEffect(() => {
    updateAvailableActions();
  }, [selectedItems, updateAvailableActions]);

  // Align selection to center
  const align = useRecoilCallback(
    async (snapshot) => {
      const selectedItemList = await getSelectedItemList(snapshot);
      // Compute
      const minMax = { min: {}, max: {} };
      minMax.min.x = Math.min(...selectedItemList.map(({ x }) => x));
      minMax.min.y = Math.min(...selectedItemList.map(({ y }) => y));
      minMax.max.x = Math.max(
        ...selectedItemList.map(({ x, actualWidth }) => x + actualWidth)
      );
      minMax.max.y = Math.max(
        ...selectedItemList.map(({ y, actualHeight }) => y + actualHeight)
      );

      const [newX, newY] = [
        (minMax.min.x + minMax.max.x) / 2,
        (minMax.min.y + minMax.max.y) / 2,
      ];
      let index = -1;
      batchUpdateItems(selectedItems, (item) => {
        index += 1;
        return {
          ...item,
          x: newX - item.actualWidth / 2 + index,
          y: newY - item.actualHeight / 2 - index,
        };
      });
    },
    [selectedItems, batchUpdateItems]
  );

  // Tap/Untap elements
  const toggleTap = useRecoilCallback(
    async (snapshot) => {
      const selectedItemList = await getSelectedItemList(snapshot);
      const tappedCount = selectedItemList.filter(
        ({ rotation }) => rotation === 90
      ).length;

      let untap = false;
      if (tappedCount > selectedItems.length / 2) {
        untap = true;
      }

      batchUpdateItems(selectedItems, (item) => ({
        ...item,
        rotation: untap ? 0 : 90,
      }));
    },
    [selectedItems, batchUpdateItems]
  );

  // Lock / unlock elements
  const toggleLock = React.useCallback(() => {
    batchUpdateItems(selectedItems, (item) => ({
      ...item,
      locked: !item.locked,
    }));
  }, [selectedItems, batchUpdateItems]);

  // Flip / unflip elements
  const toggleFlip = useRecoilCallback(
    async (snapshot) => {
      const selectedItemList = await getSelectedItemList(snapshot);
      const flippedCount = selectedItemList.filter(({ flipped }) => flipped)
        .length;

      let flip = true;
      if (flippedCount > selectedItems.length / 2) {
        flip = false;
      }
      batchUpdateItems(selectedItems, (item) => ({
        ...item,
        flipped: flip,
        unflippedFor: undefined,
      }));
      reverseItemsOrder(selectedItems);
    },
    [selectedItems, batchUpdateItems, reverseItemsOrder]
  );

  // Rotate element
  const rotate = React.useCallback(
    (angle) => {
      batchUpdateItems(selectedItems, (item) => ({
        ...item,
        rotation: (item.rotation || 0) + angle,
      }));
    },
    [selectedItems, batchUpdateItems]
  );

  // Reveal for player only
  const revealForMe = React.useCallback(() => {
    batchUpdateItems(selectedItems, (item) => ({
      ...item,
      flipped: true,
      unflippedFor: currentUser.id,
    }));
  }, [batchUpdateItems, selectedItems, currentUser.id]);

  // Remove selected items
  const removeItems = React.useCallback(
    () =>
      selectedItems.forEach((id) => {
        removeItem(id);
      }),
    [removeItem, selectedItems]
  );

  return {
    align,
    remove: removeItems,
    revealForMe,
    toggleFlip,
    toggleLock,
    toggleTap,
    shuffle: shuffleSelectedItems,
    rotate,
    availableActions,
  };
};

export default useItemActions;
