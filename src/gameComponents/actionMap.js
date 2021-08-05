// import React from "react";
// import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { nanoid } from "nanoid";
import { toast } from "react-toastify";

import { shuffle as shuffleArray, randInt } from "../views/utils";

import deleteIcon from "../images/delete.svg";
import stackToCenterIcon from "../images/stackToCenter.svg";
import stackToTopLeftIcon from "../images/stackToTopLeft.svg";
import alignAsLineIcon from "../images/alignAsLine.svg";
import alignAsSquareIcon from "../images/alignAsSquare.svg";
import duplicateIcon from "../images/duplicate.svg";
import seeIcon from "../images/see.svg";
import flipIcon from "../images/flip.svg";
import lockIcon from "../images/lock.svg";
import rotateIcon from "../images/rotate.svg";
import shuffleIcon from "../images/shuffle.svg";
import tapIcon from "../images/tap.svg";

const stackToCenter = async (
  itemIds,
  {
    stackThicknessMin = 0.5,
    stackThicknessMax = 1,
    limitCardsNumber = 32,
  } = {},
  { getItem, batchUpdateItems }
) => {
  const items = itemIds.map(getItem);

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
    ...items.map(({ x, id }) => x + document.getElementById(id).clientWidth)
  );
  minMax.max.y = Math.max(
    ...items.map(({ y, id }) => y + document.getElementById(id).clientHeight)
  );
  const { clientWidth, clientHeight } = document.getElementById(items[0].id);
  let newX = minMax.min.x + (minMax.max.x - minMax.min.x) / 2 - clientWidth / 2;
  let newY =
    minMax.min.y + (minMax.max.y - minMax.min.y) / 2 - clientHeight / 2;

  batchUpdateItems(itemIds, (item) => {
    const newItem = {
      ...item,
      x: newX,
      y: newY,
    };
    newX += stackThickness;
    newY -= stackThickness;
    return newItem;
  });
};

// Stack selection to Top Left
export const stackToTopLeft = async (
  itemIds,
  {
    stackThicknessMin = 0.5,
    stackThicknessMax = 1,
    limitCardsNumber = 32,
  } = {},
  { getItem, batchUpdateItems }
) => {
  const items = await Promise.all(itemIds.map(getItem));

  let { x: newX, y: newY } = items[0];

  // Rule to manage thickness of the stack.
  let stackThickness = stackThicknessMax;
  if (items.length >= limitCardsNumber) {
    stackThickness = stackThicknessMin;
  }

  batchUpdateItems(itemIds, (item) => {
    const newItem = {
      ...item,
      x: newX,
      y: newY,
    };
    newX += stackThickness;
    newY -= stackThickness;
    return newItem;
  });
};

// Align selection to a line
const alignAsLine = async (
  itemIds,
  { gapBetweenItems = 5 } = {},
  { getItem, batchUpdateItems }
) => {
  // Negative value is possible for 'gapBetweenItems'.
  let { x: newX, y: newY } = await getItem(itemIds[0]);

  batchUpdateItems(itemIds, (item) => {
    const { clientWidth } = document.getElementById(item.id);
    const newItem = {
      ...item,
      x: newX,
      y: newY,
    };
    newX += clientWidth + gapBetweenItems;
    return newItem;
  });
};

// Align selection to an array
const alignAsSquare = async (
  itemIds,
  { gapBetweenItems = 5 } = {},
  { batchUpdateItems, getItem }
) => {
  // Negative value is possible for 'gapBetweenItems'.
  const items = await Promise.all(itemIds.map(getItem));

  // Count number of elements
  const numberOfElements = items.length;
  const numberOfColumns = Math.ceil(Math.sqrt(numberOfElements));

  let { x: newX, y: newY } = items[0];

  let currentColumn = 1;

  batchUpdateItems(itemIds, (item) => {
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
      newX = items[0].x;
      newY += clientHeight + gapBetweenItems;
    }
    return newItem;
  });
};

const shuffleItems = async (itemIds, _, { swapItems }) => {
  itemIds.forEach((itemId) => {
    const elem = document.getElementById(itemId);
    elem.firstChild.className = "hvr-wobble-horizontal";
  });
  const shuffledItems = shuffleArray([...itemIds]);
  swapItems(itemIds, shuffledItems);
};

const randomlyRotateSelectedItems = async (
  itemIds,
  { angle, maxRotateCount },
  { batchUpdateItems }
) => {
  batchUpdateItems(itemIds, (item) => {
    const rotation =
      ((item.rotation || 0) + angle * randInt(0, maxRotateCount)) % 360;
    return { ...item, rotation };
  });
};

// Tap/Untap elements
const toggleTap = async (itemIds, _, { getItem, batchUpdateItems }) => {
  const items = await Promise.all(itemIds.map(getItem));

  const tappedCount = items.filter(({ rotation }) => rotation === 90).length;

  let untap = false;
  if (tappedCount > itemIds.length / 2) {
    untap = true;
  }

  batchUpdateItems(itemIds, (item) => ({
    ...item,
    rotation: untap ? 0 : 90,
  }));
};

// Lock / unlock elements
const toggleLock = async (itemIds, _, { batchUpdateItems }) => {
  batchUpdateItems(itemIds, (item) => ({
    ...item,
    locked: !item.locked,
  }));

  const isFirstLock = !window.localStorage.getItem("isFirstLock");

  // Help user on first lock
  if (isFirstLock) {
    toast.info(
      i18n.t(
        "You've locked your first element. Long click to select it again."
      ),
      { autoClose: false }
    );
    window.localStorage.setItem("isFirstLock", "false");
  }
};

// Flip or reveal items
export const setFlip = async (
  itemIds,
  { flip = true, reverseOrder = true } = {},
  { batchUpdateItems, reverseItemsOrder }
) => {
  batchUpdateItems(itemIds, (item) => ({
    ...item,
    flipped: flip,
    unflippedFor:
      !Array.isArray(item.unflippedFor) || item.unflippedFor.length > 0
        ? null
        : item.unflippedFor,
  }));
  if (reverseOrder) {
    reverseItemsOrder(itemIds);
  }
};

// Toggle flip state
const toggleFlip = async (
  itemIds,
  { reverseOrder = true } = {},
  baseActions
) => {
  const items = await Promise.all(itemIds.map(baseActions.getItem));

  const flippedCount = items.filter(({ flipped }) => flipped).length;

  setFlip(
    itemIds,
    {
      flip: flippedCount < itemIds.length / 2,
      reverseOrder,
    },
    baseActions
  );
};

// Rotate element
const rotate = async (itemIds, { angle }, { batchUpdateItems }) => {
  batchUpdateItems(itemIds, (item) => ({
    ...item,
    rotation: (item.rotation || 0) + angle,
  }));
};

// Reveal for player only
export const setFlipSelf = async (
  itemIds,
  { flipSelf = true } = {},
  { batchUpdateItems }
) => {
  batchUpdateItems(itemIds, (item) => {
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
};

// Reveal for player only
const toggleFlipSelf = async (itemIds, params, actions) => {
  const items = await Promise.all(itemIds.map(actions.getItem));

  const flippedSelfCount = items.filter(
    ({ unflippedFor }) =>
      Array.isArray(unflippedFor) && unflippedFor.includes(currentUser.uid)
  ).length;

  let flipSelf = true;
  if (flippedSelfCount > itemIds.length / 2) {
    flipSelf = false;
  }

  setFlipSelf(itemIds, { ...params, flipSelf }, actions);
};

const remove = async (itemIds, _, { removeItems }) => {
  removeItems(itemIds);
};

const cloneItem = async (itemIds, _, { getItem, insertItemBefore }) => {
  const items = await Promise.all(itemIds.map(getItem));

  items.forEach((itemToClone) => {
    const newItem = JSON.parse(JSON.stringify(itemToClone));
    newItem.id = nanoid();
    delete newItem.move;
    insertItemBefore(newItem, itemToClone.id);
  });
};

const actionMap = {
  flip: {
    action: toggleFlip,
    label: i18n.t("Reveal") + "/" + i18n.t("Hide"),
    shortcut: "f",
    icon: flipIcon,
  },
  reveal: {
    action: (itemIds, _, baseActions) =>
      setFlip(itemIds, { flip: false }, baseActions),
    label: i18n.t("Reveal"),
    icon: flipIcon,
  },
  hide: {
    action: (itemIds, _, baseActions) =>
      setFlip(itemIds, { flip: true }, baseActions),
    label: i18n.t("Hide"),
    icon: flipIcon,
  },
  flipSelf: {
    action: toggleFlipSelf,
    label: i18n.t("Reveal for me"),
    shortcut: "o",
    icon: seeIcon,
  },
  revealSelf: {
    action: (itemIds, _, baseActions) =>
      setFlipSelf(itemIds, { flipSelf: true }, baseActions),
    label: i18n.t("Reveal for me"),
    icon: seeIcon,
  },
  hideSelf: {
    action: (itemIds, _, baseActions) =>
      setFlipSelf(itemIds, { flipSelf: false }, baseActions),
    label: i18n.t("Hide for me"),
    icon: seeIcon,
  },
  tap: {
    action: toggleTap,
    label: i18n.t("Tap") + "/" + i18n.t("Untap"),
    shortcut: "t",
    icon: tapIcon,
  },
  stackToCenter: {
    action: stackToCenter,
    label: i18n.t("Stack To Center"),
    shortcut: "",
    multiple: true,
    icon: stackToCenterIcon,
  },
  stack: {
    action: stackToTopLeft,
    label: i18n.t("Stack To Top Left"),
    multiple: true,
    icon: stackToTopLeftIcon,
  },
  alignAsLine: {
    action: alignAsLine,
    label: i18n.t("Align as line"),
    multiple: true,
    icon: alignAsLineIcon,
  },
  alignAsSquare: {
    action: alignAsSquare,
    label: i18n.t("Align as square"),
    multiple: true,
    icon: alignAsSquareIcon,
  },
  shuffle: {
    action: shuffleItems,
    label: i18n.t("Shuffle"),
    multiple: true,
    icon: shuffleIcon,
  },
  randomlyRotate30: {
    action: (itemIds, _, baseActions) =>
      randomlyRotateSelectedItems(
        itemIds,
        {
          angle: 30,
          maxRotateCount: 11,
        },
        baseActions
      ),
    label: i18n.t("Rotate randomly 30"),
    multiple: false,
    icon: rotateIcon,
  },
  randomlyRotate45: {
    action: (itemIds, _, baseActions) =>
      randomlyRotateSelectedItems(
        itemIds,
        {
          angle: 45,
          maxRotateCount: 7,
        },
        baseActions
      ),
    label: i18n.t("Rotate randomly 45"),
    shortcut: "",
    multiple: false,
    icon: rotateIcon,
  },
  randomlyRotate60: {
    action: (itemIds, _, baseActions) =>
      randomlyRotateSelectedItems(
        itemIds,
        {
          angle: 60,
          maxRotateCount: 5,
        },
        baseActions
      ),
    label: i18n.t("Rotate randomly 60"),
    shortcut: "",
    multiple: false,
    icon: rotateIcon,
  },
  randomlyRotate90: {
    action: (itemIds, _, baseActions) =>
      randomlyRotateSelectedItems(
        itemIds,
        {
          angle: 90,
          maxRotateCount: 3,
        },
        baseActions
      ),
    label: i18n.t("Rotate randomly 90"),
    shortcut: "",
    multiple: false,
    icon: rotateIcon,
  },
  randomlyRotate180: {
    action: (itemIds, _, baseActions) =>
      randomlyRotateSelectedItems(
        itemIds,
        {
          angle: 180,
          maxRotateCount: 1,
        },
        baseActions
      ),
    label: i18n.t("Rotate randomly 180"),
    shortcut: "",
    multiple: false,
    icon: rotateIcon,
  },
  rotate30: {
    action: (itemIds, _, baseActions) =>
      rotate(itemIds, { angle: 30 }, baseActions),
    label: i18n.t("Rotate 30"),
    shortcut: "r",
    icon: rotateIcon,
  },
  rotate45: {
    action: (itemIds, _, baseActions) =>
      rotate(itemIds, { angle: 45 }, baseActions),
    label: i18n.t("Rotate 45"),
    shortcut: "r",
    icon: rotateIcon,
  },
  rotate60: {
    action: (itemIds, _, baseActions) =>
      rotate(itemIds, { angle: 60 }, baseActions),
    label: i18n.t("Rotate 60"),
    shortcut: "r",
    icon: rotateIcon,
  },
  rotate90: {
    action: (itemIds, _, baseActions) =>
      rotate(itemIds, { angle: 90 }, baseActions),
    label: i18n.t("Rotate 90"),
    shortcut: "r",
    icon: rotateIcon,
  },
  rotate180: {
    action: (itemIds, _, baseActions) =>
      rotate(itemIds, { angle: 180 }, baseActions),
    label: i18n.t("Rotate 180"),
    shortcut: "r",
    icon: rotateIcon,
  },
  clone: {
    action: cloneItem,
    label: i18n.t("Clone"),
    shortcut: "c",
    disableDblclick: true,
    edit: true,
    icon: duplicateIcon,
  },
  lock: {
    action: toggleLock,
    label: i18n.t("Unlock") + "/" + i18n.t("Lock"),
    disableDblclick: true,
    icon: lockIcon,
  },
  remove: {
    action: remove,
    label: i18n.t("Remove all"),
    shortcut: "Delete",
    edit: true,
    disableDblclick: true,
    icon: deleteIcon,
  },
};

export default actionMap;
