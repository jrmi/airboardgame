import React from "react";

import { useRecoilValue, useRecoilCallback } from "recoil";
import { useItems } from "./";
import { selectedItemsAtom } from "../Selector";

import { useUsers } from "../../users";

import intersection from "lodash.intersection";
import { ItemMapAtom } from "../";
import { getDefaultActionsFromItem } from "./Item/allItems";

import { useTranslation } from "react-i18next";
import { nanoid } from "nanoid";

import { shuffle as shuffleArray } from "../../../utils";

import deleteIcon from "../../../images/delete.svg";
import stackIcon from "../../../images/stack.svg";
import duplicateIcon from "../../../images/duplicate.svg";
import seeIcon from "../../../images/see.svg";
import flipIcon from "../../../images/flip.svg";
import lockIcon from "../../../images/lock.svg";
import rotateIcon from "../../../images/rotate.svg";
import shuffleIcon from "../../../images/shuffle.svg";
import tapIcon from "../../../images/tap.svg";

const getActionsFromItem = (item) => {
  const defaultActions = getDefaultActionsFromItem(item);
  const { actions = [] } = item;
  return defaultActions.concat(actions);
};

export const useItemActions = () => {
  const {
    batchUpdateItems,
    removeItems,
    insertItemBefore,
    reverseItemsOrder,
    swapItems,
  } = useItems();

  const { t } = useTranslation();

  const { currentUser } = useUsers();

  const selectedItems = useRecoilValue(selectedItemsAtom);
  const [availableActions, setAvailableActions] = React.useState([]);
  const isMountedRef = React.useRef(false);

  const getSelectedItemList = useRecoilCallback(
    ({ snapshot }) => async () => {
      const itemMap = await snapshot.getPromise(ItemMapAtom);
      return selectedItems.map((id) => itemMap[id]);
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
    ({ snapshot }) => async () => {
      const selectedItemList = await getSelectedItemList(snapshot);
      if (selectedItems.length > 0) {
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
    [getSelectedItemList, selectedItems.length]
  );

  // Update available actions when selection change
  React.useEffect(() => {
    updateAvailableActions();
  }, [selectedItems, updateAvailableActions]);

  // Align selection to center
  const align = useRecoilCallback(
    ({ snapshot }) => async () => {
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
    [getSelectedItemList, batchUpdateItems, selectedItems]
  );

  const shuffleSelectedItems = React.useCallback(() => {
    const shuffledItems = shuffleArray([...selectedItems]);
    swapItems(selectedItems, shuffledItems);
  }, [selectedItems, swapItems]);

  // Tap/Untap elements
  const toggleTap = useRecoilCallback(
    ({ snapshot }) => async () => {
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
    [getSelectedItemList, selectedItems, batchUpdateItems]
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
    ({ snapshot }) => async () => {
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
        unflippedFor: [],
      }));
      reverseItemsOrder(selectedItems);
    },
    [getSelectedItemList, selectedItems, batchUpdateItems, reverseItemsOrder]
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
  const toggleFlipSelf = useRecoilCallback(
    ({ snapshot }) => async () => {
      const selectedItemList = await getSelectedItemList(snapshot);
      const flippedSelfCount = selectedItemList.filter(
        ({ unflippedFor }) =>
          Array.isArray(unflippedFor) && unflippedFor.includes(currentUser.id)
      ).length;

      let flipSelf = true;
      if (flippedSelfCount > selectedItems.length / 2) {
        flipSelf = false;
      }

      batchUpdateItems(selectedItems, (item) => {
        let unflippedFor;
        if (!Array.isArray(item.unflippedFor)) {
          unflippedFor = [];
        } else {
          unflippedFor = [...item.unflippedFor];
        }
        if (flipSelf && !unflippedFor.includes(currentUser.id)) {
          unflippedFor.push(currentUser.id);
        }
        if (!flipSelf && unflippedFor.includes(currentUser.id)) {
          unflippedFor = unflippedFor.filter((id) => id !== currentUser.id);
        }
        return {
          ...item,
          flipped: true,
          unflippedFor,
        };
      });
    },
    [getSelectedItemList, selectedItems, batchUpdateItems, currentUser.id]
  );

  const removeSelectedItems = React.useCallback(
    () => removeItems(selectedItems),
    [removeItems, selectedItems]
  );

  const cloneItem = useRecoilCallback(
    ({ snapshot }) => async () => {
      const selectedItemList = await getSelectedItemList(snapshot);
      selectedItemList.forEach((itemToClone) => {
        const newItem = JSON.parse(JSON.stringify(itemToClone));
        newItem.id = nanoid();
        insertItemBefore(newItem, itemToClone.id);
      });
    },
    [getSelectedItemList, insertItemBefore]
  );

  const actionMap = React.useMemo(
    () => ({
      flip: {
        action: toggleFlip,
        label: t("Reveal") + "/" + t("Hide"),
        shortcut: "f",
        icon: flipIcon,
      },
      flipSelf: {
        action: toggleFlipSelf,
        label: t("Reveal for me"),
        shortcut: "o",
        icon: seeIcon,
      },
      tap: {
        action: toggleTap,
        label: t("Tap") + "/" + t("Untap"),
        shortcut: "t",
        icon: tapIcon,
      },
      rotate90: {
        action: rotate.bind(null, 90),
        label: t("Rotate 90"),
        icon: rotateIcon,
      },
      rotate60: {
        action: rotate.bind(null, 60),
        label: t("Rotate 60"),
        icon: rotateIcon,
      },
      rotate45: {
        action: rotate.bind(null, 45),
        label: t("Rotate 45"),
        icon: rotateIcon,
      },
      rotate30: {
        action: rotate.bind(null, 30),
        label: t("Rotate 30"),
        icon: rotateIcon,
      },
      stack: {
        action: align,
        label: t("Stack"),
        shortcut: "",
        multiple: true,
        icon: stackIcon,
      },
      shuffle: {
        action: shuffleSelectedItems,
        label: t("Shuffle"),
        shortcut: "",
        multiple: true,
        icon: shuffleIcon,
      },
      clone: {
        action: cloneItem,
        label: t("Clone"),
        shortcut: " ",
        disableDblclick: true,
        edit: true,
        icon: duplicateIcon,
      },
      lock: {
        action: toggleLock,
        label: t("Unlock") + "/" + t("Lock"),
        disableDblclick: true,
        icon: lockIcon,
      },
      remove: {
        action: removeSelectedItems,
        label: t("Remove all"),
        shortcut: "r",
        edit: true,
        disableDblclick: true,
        icon: deleteIcon,
      },
    }),
    [
      toggleFlip,
      t,
      toggleFlipSelf,
      toggleTap,
      rotate,
      align,
      shuffleSelectedItems,
      cloneItem,
      toggleLock,
      removeSelectedItems,
    ]
  );

  return {
    align,
    remove: removeSelectedItems,
    toggleFlip,
    toggleFlipSelf,
    toggleLock,
    toggleTap,
    shuffle: shuffleSelectedItems,
    rotate,
    actionMap,
    availableActions,
  };
};

export default useItemActions;
