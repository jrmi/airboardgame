import React from "react";

import { useRecoilValue, useRecoilCallback } from "recoil";
import { useItems } from "../Board/Items";
import { selectedItemsAtom } from "../Board/Selector";

import { useUsers } from "../users";

import intersection from "lodash.intersection";
import { ItemMapAtom } from "../Board";
import { getActionsFromItem } from "./";

import { useTranslation } from "react-i18next";
import { nanoid } from "nanoid";
import { toast } from "react-toastify";

import { shuffle as shuffleArray, randInt } from "../../utils";

import deleteIcon from "../../images/delete.svg";
import stackToCenterIcon from "../../images/stackToCenter.svg";
import stackToTopLeftIcon from "../../images/stackToTopLeft.svg";
import alignAsLineIcon from "../../images/alignAsLine.svg";
import alignAsSquareIcon from "../../images/alignAsSquare.svg";
import duplicateIcon from "../../images/duplicate.svg";
import seeIcon from "../../images/see.svg";
import flipIcon from "../../images/flip.svg";
import lockIcon from "../../images/lock.svg";
import rotateIcon from "../../images/rotate.svg";
import shuffleIcon from "../../images/shuffle.svg";
import tapIcon from "../../images/tap.svg";

import useLocalStorage from "../../hooks/useLocalStorage";

export const useItemActions = () => {
  const {
    batchUpdateItems,
    removeItems,
    insertItemBefore,
    reverseItemsOrder,
    swapItems,
  } = useItems();

  const { t } = useTranslation();

  const [isFirstLock, setIsFirstLock] = useLocalStorage("isFirstLock", true);

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

        const allActions = selectedItemList.reduce((acc, item) => {
          return intersection(acc, getActionsFromItem(item));
        }, getActionsFromItem(selectedItemList[0]));

        setAvailableActions(allActions);
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


  // Stack selection to Center
const stackToCenter = useRecoilCallback(
  ({ snapshot, stackThicknessMin = 0.5, stackThicknessMax = 1, limitCardsNumber = 32 }) => async () => {
    const selectedItemList = await getSelectedItemList(snapshot);

    // Rule to manage thickness of the stack.
    let stackThickness = 0;
    if (selectedItemList.length >= limitCardsNumber) {
        stackThickness = stackThicknessMin;
      } else {
        stackThickness = stackThicknessMax;
      };

    // To avoid displacement effects.
    let isSameGap = true;
    for (let i = 1; i < selectedItemList.length; i++) {
      if(Math.abs(selectedItemList[i].x - selectedItemList[i-1].x) != stackThickness) {
        isSameGap = false;
        break;
      }
      if(Math.abs(selectedItemList[i].y - selectedItemList[i-1].y) != stackThickness) {
        isSameGap = false;
        break;
      }
    }
    if (isSameGap == true) {
      return;
    }

    // Compute middle position
    const minMax = { min: {}, max: {} };
    minMax.min.x = Math.min(...selectedItemList.map(({ x }) => x));
    minMax.min.y = Math.min(...selectedItemList.map(({ y }) => y));
    minMax.max.x = Math.max(
      ...selectedItemList.map(
        ({ x, id }) => x + document.getElementById(id).clientWidth
      )
    );
    minMax.max.y = Math.max(
      ...selectedItemList.map(
        ({ y, id }) => y + document.getElementById(id).clientHeight
      )
    );
    const { clientWidth, clientHeight } = document.getElementById(selectedItemList[0].id);
    let newX = minMax.min.x + (minMax.max.x - minMax.min.x) / 2 - clientWidth / 2;
    let newY = minMax.min.y + (minMax.max.y - minMax.min.y) / 2 - clientHeight / 2; 
    

      batchUpdateItems(selectedItems, (item) => {
        const newItem = {
          ...item,
          x: newX,
          y: newY,
        };
        newX += stackThickness;
        newY -= stackThickness;
        return newItem;
      });
  },
  [getSelectedItemList, batchUpdateItems, selectedItems]
);

// Stack selection to Top Left
const stackToTopLeft = useRecoilCallback(
  ({ snapshot, stackThicknessMin = 0.5, stackThicknessMax = 1, limitCardsNumber = 32 }) => async () => {
    const selectedItemList = await getSelectedItemList(snapshot);

    let { x:newX, y:newY} = selectedItemList[0];

    // Rule to manage thickness of the stack.
    let stackThickness = 0;
    if (selectedItemList.length >= limitCardsNumber) {
        stackThickness = stackThicknessMin;
      } else {
        stackThickness = stackThicknessMax;
      };
    

    batchUpdateItems(selectedItems, (item) => {
      const newItem = {
        ...item,
        x: newX,
        y: newY,
      };
      newX += stackThickness;
      newY -= stackThickness;
      return newItem;
    });
  },
  [getSelectedItemList, batchUpdateItems, selectedItems]
);

  // Align selection to a line
  const alignAsLine = useRecoilCallback(
    ({ snapshot, gapBetweenItems = 5 }) => async () => { // Negative value is possible for 'gapBetweenItems'.
      const selectedItemList = await getSelectedItemList(snapshot);

      // Count number of elements
      const numberOfElements = selectedItemList.length;

      let { x:newX, y:newY} = selectedItemList[0];
      let index = numberOfElements;

      batchUpdateItems(selectedItems, (item) => {
        index -= 1;
        const { clientWidth } = document.getElementById(item.id);
        const newItem = {
          ...item,
          x: newX,
          y: newY,
        };
        newX += clientWidth + gapBetweenItems;
        return newItem;
      });
    },
    [getSelectedItemList, batchUpdateItems, selectedItems]
  );

  // Align selection to an array
  const alignAsSquare = useRecoilCallback(
    ({ snapshot, gapBetweenItems = 5 }) => async () => { // Negative value is possible for 'gapBetweenItems'.
      
      const selectedItemList = await getSelectedItemList(snapshot);

      // Count number of elements
      const numberOfElements = selectedItemList.length;
      const numberOfColumns = Math.ceil(Math.sqrt(numberOfElements));

      let { x:newX, y:newY} = selectedItemList[0];

      let currentColumn = 1;
      let isNewRow = false;

      batchUpdateItems(selectedItems, (item) => {
        const { clientWidth, clientHeight } = document.getElementById(item.id);
        const newItem = {
          ...item,
          x: newX,
          y: newY,
        };
        newX += clientWidth + gapBetweenItems;
        currentColumn += 1;
        if (currentColumn > numberOfColumns) {
          currentColumn = 1;
          newX = selectedItemList[0].x;
          newY += clientHeight + gapBetweenItems;
        }
        return newItem;
      });
    },
    [getSelectedItemList, batchUpdateItems, selectedItems]
  );

  const shuffleSelectedItems = React.useCallback(() => {
    selectedItems.forEach((itemId) => {
      const elem = document.getElementById(itemId);
      elem.firstChild.className = "hvr-wobble-horizontal";
    });
    const shuffledItems = shuffleArray([...selectedItems]);
    swapItems(selectedItems, shuffledItems);
  }, [selectedItems, swapItems]);

  const randomlyRotateSelectedItems = React.useCallback(
    (angle, maxRotateCount) => {
      batchUpdateItems(selectedItems, (item) => {
        const rotation =
          ((item.rotation || 0) + angle * randInt(0, maxRotateCount)) % 360;
        return { ...item, rotation };
      });
    },
    [selectedItems, batchUpdateItems]
  );

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

    // Help user on first lock
    if (isFirstLock) {
      toast.info(
        t("You've locked your first element. Long click to select it again."),
        { autoClose: false }
      );
      setIsFirstLock(false);
    }
  }, [batchUpdateItems, selectedItems, isFirstLock, t, setIsFirstLock]);

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
        unflippedFor:
          !Array.isArray(item.unflippedFor) || item.unflippedFor.length > 0
            ? null
            : item.unflippedFor,
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
          Array.isArray(unflippedFor) && unflippedFor.includes(currentUser.uid)
      ).length;

      let flipSelf = true;
      if (flippedSelfCount > selectedItems.length / 2) {
        flipSelf = false;
      }

      batchUpdateItems(selectedItems, (item) => {
        let { unflippedFor = [] } = item;

        if (!Array.isArray(item.unflippedFor)) {
          unflippedFor = [];
        }

        if (flipSelf && !unflippedFor.includes(currentUser.uid)) {
          unflippedFor = [...unflippedFor, currentUser.uid];
        }
        if (!flipSelf && unflippedFor.includes(currentUser.uid)) {
          unflippedFor = unflippedFor.filter((id) => id !== currentUser.uid);
        }
        return {
          ...item,
          flipped: true,
          unflippedFor,
        };
      });
    },
    [getSelectedItemList, selectedItems, batchUpdateItems, currentUser.uid]
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
      stackToCenter: {
        action: stackToCenter,
        label: t("Stack To Center"),
        shortcut: "",
        multiple: true,
        icon: stackToCenterIcon,
      },
      stackToTopLeft: {
        action: stackToTopLeft,
        label: t("Stack To Top Left"),
        shortcut: "",
        multiple: true,
        icon: stackToTopLeftIcon,
      },
      alignAsLine: {
        action: alignAsLine,
        label: t("Align as line"),
        shortcut: "",
        multiple: true,
        icon: alignAsLineIcon,
      },
      alignAsSquare: {
        action: alignAsSquare,
        label: t("Align as square"),
        shortcut: "",
        multiple: true,
        icon: alignAsSquareIcon,
      },
      shuffle: {
        action: shuffleSelectedItems,
        label: t("Shuffle"),
        shortcut: "",
        multiple: true,
        icon: shuffleIcon,
      },
      randomlyRotate30: {
        action: randomlyRotateSelectedItems.bind(null, 30, 11),
        label: t("Rotate randomly 30"),
        shortcut: "",
        multiple: false,
        icon: rotateIcon,
      },
      randomlyRotate45: {
        action: randomlyRotateSelectedItems.bind(null, 45, 7),
        label: t("Rotate randomly 45"),
        shortcut: "",
        multiple: false,
        icon: rotateIcon,
      },
      randomlyRotate60: {
        action: randomlyRotateSelectedItems.bind(null, 60, 5),
        label: t("Rotate randomly 60"),
        shortcut: "",
        multiple: false,
        icon: rotateIcon,
      },
      randomlyRotate90: {
        action: randomlyRotateSelectedItems.bind(null, 90, 3),
        label: t("Rotate randomly 90"),
        shortcut: "",
        multiple: false,
        icon: rotateIcon,
      },
      randomlyRotate180: {
        action: randomlyRotateSelectedItems.bind(null, 180, 1),
        label: t("Rotate randomly 180"),
        shortcut: "",
        multiple: false,
        icon: rotateIcon,
      },
      rotate30: {
        action: rotate.bind(null, 30),
        label: t("Rotate 30"),
        icon: rotateIcon,
      },
      rotate45: {
        action: rotate.bind(null, 45),
        label: t("Rotate 45"),
        icon: rotateIcon,
      },
      rotate60: {
        action: rotate.bind(null, 60),
        label: t("Rotate 60"),
        icon: rotateIcon,
      },
      rotate90: {
        action: rotate.bind(null, 90),
        label: t("Rotate 90"),
        icon: rotateIcon,
      },
      rotate180: {
        action: rotate.bind(null, 180),
        label: t("Rotate 180"),
        icon: rotateIcon,
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
        shortcut: "Delete",
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
      stackToTopLeft,
      shuffleSelectedItems,
      cloneItem,
      toggleLock,
      removeSelectedItems,
      randomlyRotateSelectedItems,
      alignAsLine,
      alignAsSquare,
    ]
  );

  return {
    stackToTopLeft,
    remove: removeSelectedItems,
    toggleFlip,
    toggleFlipSelf,
    toggleLock,
    toggleTap,
    shuffle: shuffleSelectedItems,
    rotate,
    actionMap,
    availableActions,
    randomlyRotate: randomlyRotateSelectedItems,
  };
};

export default useItemActions;
