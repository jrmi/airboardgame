import React from "react";

import { useRecoilValue } from "recoil";
import { useItems } from "./";
import { selectedItemsAtom } from "../Selector";

import { useUsers } from "../../users";

import intersection from "lodash.intersection";

const getDefaultActionsFromItem = (item) => {
  switch (item.type) {
    case "image":
      if (item.backContent) {
        return ["flip", "tap", "lock", "remove", "stack"];
      } else {
        return ["tap", "lock", "remove", "stack"];
      }
    case "rect":
    case "round":
    case "note":
    case "counter":
    case "dice":
      return ["lock", "remove"];
    default:
      return [];
  }
};

const getActionsFromItem = (item) => {
  const defaultActions = getDefaultActionsFromItem(item);
  const { actions = [] } = item;
  return defaultActions.concat(actions);
};

export const useItemActions = () => {
  const {
    itemList,
    batchUpdateItems,
    removeItem,
    reverseItemsOrder,
    shuffleSelectedItems,
  } = useItems();

  const { currentUser } = useUsers();

  const selectedItems = useRecoilValue(selectedItemsAtom);

  const selectedItemList = React.useMemo(() => {
    return itemList.filter(({ id }) => selectedItems.includes(id));
  }, [itemList, selectedItems]);

  // Align selection to center
  const align = React.useCallback(() => {
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
  }, [selectedItemList, selectedItems, batchUpdateItems]);

  const toggleTap = React.useCallback(() => {
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
  }, [selectedItems, batchUpdateItems, selectedItemList]);

  const toggleLock = React.useCallback(() => {
    batchUpdateItems(selectedItems, (item) => ({
      ...item,
      locked: !item.locked,
    }));
  }, [selectedItems, batchUpdateItems]);

  const toggleFlip = React.useCallback(() => {
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
  }, [selectedItemList, selectedItems, batchUpdateItems, reverseItemsOrder]);

  const rotate = React.useCallback(
    (angle) => {
      batchUpdateItems(selectedItems, (item) => ({
        ...item,
        rotation: (item.rotation || 0) + angle,
      }));
    },
    [selectedItems, batchUpdateItems]
  );

  const revealForMe = React.useCallback(() => {
    batchUpdateItems(selectedItems, (item) => ({
      ...item,
      flipped: true,
      unflippedFor: currentUser.id,
    }));
  }, [batchUpdateItems, selectedItems, currentUser.id]);

  const removeItems = React.useCallback(
    () =>
      selectedItems.forEach((id) => {
        removeItem(id);
      }),
    [removeItem, selectedItems]
  );

  const availableActions = React.useMemo(() => {
    if (selectedItemList.length > 0) {
      return selectedItemList.reduce((acc, item) => {
        return intersection(acc, getActionsFromItem(item));
      }, getActionsFromItem(selectedItemList[0]));
    } else {
      return [];
    }
  }, [selectedItemList]);

  return {
    align,
    remove: removeItems,
    revealForMe,
    toggleFlip,
    toggleLock,
    toggleTap,
    shuffle: shuffleSelectedItems,
    rotate,
    selectedItemList,
    availableActions,
  };
};

export default useItemActions;
