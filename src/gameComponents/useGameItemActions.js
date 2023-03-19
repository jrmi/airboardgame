import React from "react";

import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useItemActions, useUsers, useSelectedItems } from "react-sync-board";

import {
  shuffle as shuffleArray,
  randInt,
  uid,
  getItemElement,
  playAudio,
} from "../utils";

import itemTemplates from "./itemTemplates";
import RotateActionForm from "./forms/RotateActionForm";
import RandomlyRotateActionForm from "./forms/RandomlyRotateActionForm";

import deleteIcon from "../media/images/delete.svg";
import stackToCenterIcon from "../media/images/stackToCenter.svg";
import stackToTopLeftIcon from "../media/images/stackToTopLeft.svg";
import alignAsLineIcon from "../media/images/alignAsLine.svg";
import alignAsSquareIcon from "../media/images/alignAsSquare.svg";
import duplicateIcon from "../media/images/duplicate.svg";
import seeIcon from "../media/images/see.svg";
import flipIcon from "../media/images/flip.svg";
import lockIcon from "../media/images/lock.svg";
import rotateIcon from "../media/images/rotate.svg";
import shuffleIcon from "../media/images/shuffle.svg";
import tapIcon from "../media/images/tap.svg";
import rollIcon from "../media/images/rolling-dices.svg";
import arrowLeftIcon from "../media/images/arrowLeft.svg";
import arrowRightIcon from "../media/images/arrowRight.svg";

import flipAudio from "../media/audio/flip.wav?url";
import rollAudio from "../media/audio/roll.wav?url";
import shuffleAudio from "../media/audio/shuffle.wav?url";

import useLocalStorage from "../hooks/useLocalStorage";

export const useGameItemActions = () => {
  const {
    batchUpdateItems,
    removeItems,
    pushItem,
    reverseItemsOrder,
    swapItems,
    getItems,
  } = useItemActions();

  const { t } = useTranslation();

  const [isFirstLock, setIsFirstLock] = useLocalStorage("isFirstLock", true);

  const { currentUser } = useUsers();

  const selectedItems = useSelectedItems();

  const getItemListOrSelected = React.useCallback(
    async (itemIds) => {
      if (itemIds) {
        return [itemIds, await getItems(itemIds)];
      } else {
        return [selectedItems, await getItems(selectedItems)];
      }
    },
    [getItems, selectedItems]
  );

  // Stack selection to Center
  const stackToCenter = React.useCallback(
    async (
      itemIds,
      {
        stackThicknessMin = 0.5,
        stackThicknessMax = 1,
        limitCardsNumber = 32,
      } = {}
    ) => {
      const [ids, items] = await getItemListOrSelected(itemIds);

      // Rule to manage thickness of the stack.
      let stackThickness = stackThicknessMax;
      if (items.length >= limitCardsNumber) {
        stackThickness = stackThicknessMin;
      }

      // To avoid displacement effects.
      let isSameGap = true;
      for (let i = 1; i < items.length; i++) {
        if (Math.abs(items[i].x - items[i - 1].x) != stackThickness) {
          isSameGap = false;
          break;
        }
        if (Math.abs(items[i].y - items[i - 1].y) != stackThickness) {
          isSameGap = false;
          break;
        }
      }
      if (isSameGap == true) {
        return;
      }

      // Compute middle position
      const minMax = { min: {}, max: {} };
      minMax.min.x = Math.min(...items.map(({ x }) => x));
      minMax.min.y = Math.min(...items.map(({ y }) => y));
      minMax.max.x = Math.max(
        ...items.map(({ x, id }) => x + getItemElement(id).clientWidth)
      );
      minMax.max.y = Math.max(
        ...items.map(({ y, id }) => y + getItemElement(id).clientHeight)
      );
      const { clientWidth, clientHeight } = getItemElement(items[0].id);
      let newX =
        minMax.min.x + (minMax.max.x - minMax.min.x) / 2 - clientWidth / 2;
      let newY =
        minMax.min.y + (minMax.max.y - minMax.min.y) / 2 - clientHeight / 2;

      batchUpdateItems(ids, (item) => {
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
    [batchUpdateItems, getItemListOrSelected]
  );

  // Stack selection to Top Left
  const stackToTopLeft = React.useCallback(
    async (
      itemIds,
      {
        stackThicknessMin = 0.5,
        stackThicknessMax = 1,
        limitCardsNumber = 32,
      } = {}
    ) => {
      const [ids, items] = await getItemListOrSelected(itemIds);

      let { x: newX, y: newY } = items[0];

      // Rule to manage thickness of the stack.
      let stackThickness = stackThicknessMax;
      if (items.length >= limitCardsNumber) {
        stackThickness = stackThicknessMin;
      }

      batchUpdateItems(ids, (item) => {
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
    [batchUpdateItems, getItemListOrSelected]
  );

  // Align selection to a line
  const alignAsLine = React.useCallback(
    async (itemIds, { gapBetweenItems = 5 } = {}) => {
      // Negative value is possible for 'gapBetweenItems'.
      const [ids, items] = await getItemListOrSelected(itemIds);

      let { x: newX, y: newY } = items[0];

      batchUpdateItems(ids, (item) => {
        const { clientWidth } = getItemElement(item.id);
        const newItem = {
          ...item,
          x: newX,
          y: newY,
        };
        newX += clientWidth + gapBetweenItems;
        return newItem;
      });
    },
    [getItemListOrSelected, batchUpdateItems]
  );

  // Align selection to an array
  const alignAsSquare = React.useCallback(
    async (itemIds, { gapBetweenItems = 5 } = {}) => {
      // Negative value is possible for 'gapBetweenItems'.
      const [ids, items] = await getItemListOrSelected(itemIds);

      // Count number of elements
      const numberOfElements = items.length;
      const numberOfColumns = Math.ceil(Math.sqrt(numberOfElements));

      let { x: newX, y: newY } = items[0];

      let currentColumn = 1;

      batchUpdateItems(ids, (item) => {
        const { clientWidth, clientHeight } = getItemElement(item.id);
        const newItem = {
          ...item,
          x: newX,
          y: newY,
        };
        newX += clientWidth + gapBetweenItems;
        currentColumn += 1;
        if (currentColumn > numberOfColumns) {
          currentColumn = 1;
          newX = items[0].x;
          newY += clientHeight + gapBetweenItems;
        }
        return newItem;
      });
    },
    [getItemListOrSelected, batchUpdateItems]
  );

  const snapToPoint = React.useCallback(
    async (itemIds, { x, y } = {}) => {
      batchUpdateItems(itemIds, (item) => {
        const { clientWidth, clientHeight } = getItemElement(item.id);
        let newX = x - clientWidth / 2;
        let newY = y - clientHeight / 2;

        const newItem = {
          ...item,
          x: newX,
          y: newY,
        };
        return newItem;
      });
    },
    [batchUpdateItems]
  );

  const roll = React.useCallback(
    async (itemIds) => {
      const [ids] = await getItemListOrSelected(itemIds);
      ids.forEach((itemId) => {
        const elem = getItemElement(itemId);
        elem.firstChild.className = "hvr-wobble-horizontal";
      });

      const getSideCount = (item) => {
        switch (item.type) {
          case "dice":
            return item.side || 6;
          case "diceImage":
          case "imageSequence":
            return item.images.length;
          default:
            return 6;
        }
      };

      const simulateRoll = (nextTimeout) => {
        batchUpdateItems(ids, (item) => {
          return {
            ...item,
            value: randInt(0, getSideCount(item) - 1),
          };
        });
        if (nextTimeout < 300) {
          setTimeout(
            () => simulateRoll(nextTimeout + randInt(10, 50)),
            nextTimeout
          );
        }
      };
      simulateRoll(100);

      playAudio(rollAudio, 0.4);
    },
    [batchUpdateItems, getItemListOrSelected]
  );

  const changeImage = React.useCallback(
    async (itemIds, { step = 1 }) => {
      const [ids] = await getItemListOrSelected(itemIds);
      batchUpdateItems(ids, (item) => {
        const { value = 0, images } = item;
        if (step > 0) {
          return {
            ...item,
            value: (value + step) % images.length,
          };
        } else {
          const newValue = value + step;
          return {
            ...item,
            value: newValue >= 0 ? newValue : images.length + newValue,
          };
        }
      });
    },
    [batchUpdateItems, getItemListOrSelected]
  );

  const shuffleItems = React.useCallback(
    async (itemIds) => {
      const [ids] = await getItemListOrSelected(itemIds);

      ids.forEach((itemId) => {
        const elem = getItemElement(itemId);
        elem.firstChild.className = "hvr-wobble-horizontal";
      });
      const shuffledItems = shuffleArray([...ids]);
      swapItems(ids, shuffledItems);

      playAudio(shuffleAudio, 0.5);
    },
    [getItemListOrSelected, swapItems]
  );

  const randomlyRotateSelectedItems = React.useCallback(
    async (itemIds, { angle, maxRotateCount = 0 }) => {
      const [ids] = await getItemListOrSelected(itemIds);

      const maxRotate = maxRotateCount || Math.round(360 / angle);

      batchUpdateItems(ids, (item) => {
        const rotation =
          ((item.rotation || 0) + angle * randInt(0, maxRotate)) % 360;
        return { ...item, rotation };
      });
    },
    [getItemListOrSelected, batchUpdateItems]
  );

  // Tap/Untap elements
  const toggleTap = React.useCallback(
    async (itemIds) => {
      const [ids, items] = await getItemListOrSelected(itemIds);

      const tappedCount = items.filter(({ tapped, rotation }) =>
        tapped !== undefined ? tapped : rotation === 90
      ).length;

      let tap = true;
      if (tappedCount > ids.length / 2) {
        tap = false;
      }

      batchUpdateItems(ids, (item) => ({
        ...item,
        tapped: tap,
        rotation: tap ? (item.rotation || 0) + 90 : (item.rotation || 0) - 90,
      }));
    },
    [getItemListOrSelected, batchUpdateItems]
  );

  // Lock / unlock elements
  const toggleLock = React.useCallback(
    async (itemIds) => {
      const [ids] = await getItemListOrSelected(itemIds);

      batchUpdateItems(ids, (item) => ({
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
    },
    [getItemListOrSelected, batchUpdateItems, isFirstLock, t, setIsFirstLock]
  );

  // Flip or reveal items
  const setFlip = React.useCallback(
    async (itemIds, { flip = true, reverseOrder = true } = {}) => {
      const items = getItems(itemIds);

      // Filter non flipped things
      const itemIdsToFlip = items
        .filter((item) => {
          const { flipped, type } = item;
          const { availableActions } = itemTemplates[type];
          let actions = availableActions;
          if (typeof availableActions === "function") {
            actions = availableActions(item);
          }

          return flipped !== flip && actions.includes("flip");
        })
        .map(({ id }) => id);

      batchUpdateItems(itemIdsToFlip, (item) => ({
        ...item,
        flipped: flip,
        unflippedFor:
          !Array.isArray(item.unflippedFor) || item.unflippedFor.length > 0
            ? null
            : item.unflippedFor,
      }));
      if (reverseOrder) {
        reverseItemsOrder(itemIdsToFlip);
      }
      if (itemIdsToFlip.length) {
        playAudio(flipAudio, 0.2);
      }
    },
    [batchUpdateItems, getItems, reverseItemsOrder]
  );

  // Toggle flip state
  const toggleFlip = React.useCallback(
    async (itemIds, { reverseOrder = true } = {}) => {
      const [ids, items] = await getItemListOrSelected(itemIds);

      const flippedCount = items.filter(({ flipped }) => flipped).length;

      setFlip(ids, {
        flip: flippedCount < ids.length / 2,
        reverseOrder,
      });
    },
    [getItemListOrSelected, setFlip]
  );

  // Rotate element
  const rotate = React.useCallback(
    async (itemIds, { angle }) => {
      const [ids] = await getItemListOrSelected(itemIds);

      batchUpdateItems(ids, (item) => ({
        ...item,
        rotation: (item.rotation || 0) + angle,
      }));
    },
    [getItemListOrSelected, batchUpdateItems]
  );

  // Reveal for player only
  const setFlipSelf = React.useCallback(
    async (itemIds, { flipSelf = true } = {}) => {
      const items = getItems(itemIds);

      // Filter non already flipped for self items
      const itemIdsToFlip = items
        .filter((item) => {
          const { unflippedFor, type } = item;

          const { availableActions } = itemTemplates[type];
          let actions = availableActions;
          if (typeof availableActions === "function") {
            actions = availableActions(item);
          }
          const isFlippedFor =
            Array.isArray(unflippedFor) &&
            unflippedFor.includes(currentUser.uid);

          return actions.includes("flip") && flipSelf !== isFlippedFor;
        })
        .map(({ id }) => id);

      batchUpdateItems(itemIdsToFlip, (item) => {
        let { unflippedFor = [] } = item;

        if (!Array.isArray(item.unflippedFor)) {
          unflippedFor = [];
        }
        const isFlippedFor = unflippedFor.includes(currentUser.uid);

        if (flipSelf && !isFlippedFor) {
          unflippedFor = [...unflippedFor, currentUser.uid];
        }
        if (!flipSelf && isFlippedFor) {
          unflippedFor = unflippedFor.filter((id) => id !== currentUser.uid);
        }
        return {
          ...item,
          flipped: true,
          unflippedFor,
        };
      });

      if (itemIdsToFlip.length) {
        playAudio(flipAudio, 0.2);
      }
    },
    [batchUpdateItems, currentUser.uid, getItems]
  );

  // Reveal for player only
  const toggleFlipSelf = React.useCallback(
    async (itemIds) => {
      const [ids, items] = await getItemListOrSelected(itemIds);

      const flippedSelfCount = items.filter(
        ({ unflippedFor }) =>
          Array.isArray(unflippedFor) && unflippedFor.includes(currentUser.uid)
      ).length;

      let flipSelf = true;
      if (flippedSelfCount > ids.length / 2) {
        flipSelf = false;
      }

      setFlipSelf(ids, { flipSelf });
    },
    [getItemListOrSelected, setFlipSelf, currentUser.uid]
  );

  const remove = React.useCallback(
    async (itemIds) => {
      const [ids] = await getItemListOrSelected(itemIds);
      removeItems(ids);
    },
    [getItemListOrSelected, removeItems]
  );

  const cloneItem = React.useCallback(
    async (itemIds) => {
      const [, items] = await getItemListOrSelected(itemIds);
      items.forEach((itemToClone) => {
        const newItem = JSON.parse(JSON.stringify(itemToClone));
        newItem.id = uid();
        delete newItem.move;
        pushItem(newItem, itemToClone.id);
      });
    },
    [getItemListOrSelected, pushItem]
  );

  const actionMap = React.useMemo(() => {
    const actions = {
      flip: {
        action: () => toggleFlip,
        label: t("Reveal") + "/" + t("Hide"),
        shortcut: "f",
        icon: flipIcon,
      },
      reveal: {
        action: () => (itemIds) => setFlip(itemIds, { flip: false }),
        label: t("Reveal"),
        icon: flipIcon,
      },
      hide: {
        action: () => (itemIds) => setFlip(itemIds, { flip: true }),
        label: t("Hide"),
        icon: flipIcon,
      },
      flipSelf: {
        action: () => toggleFlipSelf,
        label: t("Reveal for me"),
        shortcut: "o",
        icon: seeIcon,
      },
      revealSelf: {
        action: () => (itemIds) => setFlipSelf(itemIds, { flipSelf: true }),
        label: t("Reveal for me"),
        icon: seeIcon,
      },
      hideSelf: {
        action: () => (itemIds) => setFlipSelf(itemIds, { flipSelf: false }),
        label: t("Hide for me"),
        icon: seeIcon,
      },
      tap: {
        action: () => toggleTap,
        label: t("Tap") + "/" + t("Untap"),
        shortcut: "t",
        icon: tapIcon,
      },
      stackToCenter: {
        action: () => stackToCenter,
        label: t("Stack To Center"),
        shortcut: "c",
        multiple: true,
        icon: stackToCenterIcon,
      },
      stack: {
        action: () => stackToTopLeft,
        label: t("Stack To Top Left"),
        shortcut: "p",
        multiple: true,
        icon: stackToTopLeftIcon,
      },
      alignAsLine: {
        action: () => alignAsLine,
        label: t("Align as line"),
        multiple: true,
        icon: alignAsLineIcon,
      },
      alignAsSquare: {
        action: () => alignAsSquare,
        label: t("Align as square"),
        multiple: true,
        icon: alignAsSquareIcon,
      },
      roll: {
        action: () => roll,
        label: t("Roll"),
        shortcut: "r",
        icon: rollIcon,
      },
      nextImage: {
        action: () => (itemIds) => changeImage(itemIds, { step: 1 }),
        label: t("Next"),
        shortcut: "n",
        icon: arrowRightIcon,
      },
      prevImage: {
        action: () => (itemIds) => changeImage(itemIds, { step: -1 }),
        label: t("Previous"),
        shortcut: "b",
        icon: arrowLeftIcon,
      },
      shuffle: {
        action: () => shuffleItems,
        label: t("Shuffle"),
        shortcut: "z",
        multiple: true,
        icon: shuffleIcon,
      },
      randomlyRotate: {
        action: ({ angle = 25, maxRotateCount = 0 } = {}) => (itemIds) =>
          randomlyRotateSelectedItems(itemIds, {
            angle,
            maxRotateCount,
          }),
        label: ({ angle = 25 } = {}) =>
          t("Rotate randomly {{angle}}°", { angle }),
        genericLabel: t("Rotate randomly"),
        multiple: false,
        icon: rotateIcon,
        form: RandomlyRotateActionForm,
      },
      randomlyRotate30: {
        action: () => (itemIds) =>
          randomlyRotateSelectedItems(itemIds, {
            angle: 30,
            maxRotateCount: 11,
          }),
        label: t("Rotate randomly 30"),
        multiple: false,
        icon: rotateIcon,
      },
      randomlyRotate45: {
        action: () => (itemIds) =>
          randomlyRotateSelectedItems(itemIds, {
            angle: 45,
            maxRotateCount: 7,
          }),
        label: t("Rotate randomly 45"),
        shortcut: "",
        multiple: false,
        icon: rotateIcon,
      },
      randomlyRotate60: {
        action: () => (itemIds) =>
          randomlyRotateSelectedItems(itemIds, {
            angle: 60,
            maxRotateCount: 5,
          }),
        label: t("Rotate randomly 60"),
        shortcut: "",
        multiple: false,
        icon: rotateIcon,
      },
      randomlyRotate90: {
        action: () => (itemIds) =>
          randomlyRotateSelectedItems(itemIds, {
            angle: 90,
            maxRotateCount: 3,
          }),
        label: t("Rotate randomly 90"),
        shortcut: "",
        multiple: false,
        icon: rotateIcon,
      },
      randomlyRotate180: {
        action: () => (itemIds) =>
          randomlyRotateSelectedItems(itemIds, {
            angle: 180,
            maxRotateCount: 1,
          }),
        label: t("Rotate randomly 180"),
        shortcut: "",
        multiple: false,
        icon: rotateIcon,
      },
      rotate: {
        action: ({ angle = 25 } = {}) => (itemIds) =>
          rotate(itemIds, { angle }),
        label: ({ angle = 25 } = {}) => t("Rotate {{angle}}°", { angle }),
        genericLabel: t("Rotate"),
        shortcut: "r",
        icon: rotateIcon,
        form: RotateActionForm,
      },
      rotate30: {
        action: () => (itemIds) => rotate(itemIds, { angle: 30 }),
        label: t("Rotate 30"),
        shortcut: "r",
        icon: rotateIcon,
      },
      rotate45: {
        action: () => (itemIds) => rotate(itemIds, { angle: 45 }),
        label: t("Rotate 45"),
        shortcut: "r",
        icon: rotateIcon,
      },
      rotate60: {
        action: () => (itemIds) => rotate(itemIds, { angle: 60 }),
        label: t("Rotate 60"),
        shortcut: "r",
        icon: rotateIcon,
      },
      rotate90: {
        action: () => (itemIds) => rotate(itemIds, { angle: 90 }),
        label: t("Rotate 90"),
        shortcut: "r",
        icon: rotateIcon,
      },
      rotate180: {
        action: () => (itemIds) => rotate(itemIds, { angle: 180 }),
        label: t("Rotate 180"),
        shortcut: "r",
        icon: rotateIcon,
      },
      clone: {
        action: () => cloneItem,
        label: t("Clone"),
        shortcut: "c",
        disableDblclick: true,
        icon: duplicateIcon,
      },
      lock: {
        action: () => toggleLock,
        label: t("Unlock") + "/" + t("Lock"),
        shortcut: "l",
        disableDblclick: true,
        edit: true,
        icon: lockIcon,
      },
      remove: {
        action: () => remove,
        label: t("Remove all"),
        shortcut: "Delete",
        edit: true,
        disableDblclick: true,
        icon: deleteIcon,
      },
    };

    return Object.fromEntries(
      Object.entries(actions).map(([key, value]) => {
        const { label } = value;
        if (typeof label === "string") {
          value.label = () => label;
        }
        return [key, value];
      })
    );
  }, [
    alignAsLine,
    alignAsSquare,
    cloneItem,
    changeImage,
    randomlyRotateSelectedItems,
    remove,
    roll,
    rotate,
    setFlip,
    setFlipSelf,
    shuffleItems,
    stackToCenter,
    stackToTopLeft,
    t,
    toggleFlip,
    toggleFlipSelf,
    toggleLock,
    toggleTap,
  ]);

  return {
    randomlyRotate: randomlyRotateSelectedItems,
    remove,
    roll,
    changeImage,
    rotate,
    stack: stackToTopLeft,
    setFlip,
    setFlipSelf,
    toggleFlip,
    toggleFlipSelf,
    toggleLock,
    toggleTap,
    snapToPoint,
    shuffle: shuffleItems,
    actionMap,
  };
};

export default useGameItemActions;
