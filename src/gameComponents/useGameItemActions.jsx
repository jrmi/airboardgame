import React from "react";

import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  useItemActions,
  useUsers,
  useGetSelectedItems,
  useItemInteraction,
} from "react-sync-board";

import {
  shuffle as shuffleArray,
  randInt,
  uid,
  getItemElement,
  playAudio,
} from "../utils";

import itemTemplates from "./itemTemplates";
import ActionRotateForm from "./actionForms/ActionRotateForm";
import ActionRandomlyRotateForm from "./actionForms/ActionRandomlyRotateForm";
import ActionRollLayerForm from "./actionForms/ActionRollLayerForm";
import ActionChangeImageForm from "./actionForms/ActionChangeImageForm";
import ActionChangeImageLayerForm from "./actionForms/ActionChangeImageLayerForm";

import stackToCenterIcon from "../media/images/stackToCenter.svg";
import stackToTopLeftIcon from "../media/images/stackToTopLeft.svg";
import alignAsLineIcon from "../media/images/alignAsLine.svg";
import alignAsSquareIcon from "../media/images/alignAsSquare.svg";
import flipIcon from "../media/images/flip.svg";
import shuffleIcon from "../media/images/shuffle.svg";
import tapIcon from "../media/images/tap.svg";

import { GiRollingDices } from "react-icons/gi";
import {
  FiPlusCircle,
  FiLock,
  FiMinusCircle,
  FiCopy,
  FiEye,
  FiEyeOff,
  FiRotateCw,
  FiTrash2,
} from "react-icons/fi";

import flipAudio from "../media/audio/flip.ogg?url";
import rollAudio from "../media/audio/roll.ogg?url";
import shuffleAudio from "../media/audio/shuffle.ogg?url";

import useLocalStorage from "../hooks/useLocalStorage";
import { useCurrentUserGroupId } from "../hooks/useGroups";

export const useGameItemActions = () => {
  const {
    batchUpdateItems,
    removeItems,
    pushItems,
    reverseItemsOrder,
    swapItems,
    getItems,
  } = useItemActions();
  const { call: callPlaceInteractions } = useItemInteraction("place");

  const { t } = useTranslation();

  const [isFirstLock, setIsFirstLock] = useLocalStorage("isFirstLock", true);

  const { currentUser } = useUsers();
  const currentUserGroupId = useCurrentUserGroupId();

  const getSelectedItems = useGetSelectedItems();

  const getItemListOrSelected = React.useCallback(
    async (itemIds) => {
      if (itemIds) {
        return [itemIds, await getItems(itemIds)];
      } else {
        const selectedItems = getSelectedItems();
        return [selectedItems, await getItems(selectedItems)];
      }
    },
    [getItems, getSelectedItems]
  );

  // Given a map of { itemId: angleDelta }, compute the new position/rotation
  // of every item recursively held on top of each rotated item (via the
  // "hold" mechanism's linkedItems), so a whole stack rotates as a rigid
  // unit around its holder's center, keeping items' relative position.
  //
  // Each held item carries heldOffset/heldAngle, captured once when it was
  // placed on its holder (see captureHeldReferences). Every subsequent
  // rotation is recomputed from that fixed reference plus the holder's
  // current total rotation, rather than from the held item's own (already
  // rotated) live position -- so floating point error from Math.cos/Math.sin
  // can't compound across repeated rotations. Items without a stored
  // reference (e.g. from before this existed) fall back to deriving one
  // from the live position, matching the previous behavior for that step.
  const computeHeldRotationUpdates = React.useCallback(
    (rootAngles) => {
      const heldUpdates = {};
      const processedHeld = new Set(Object.keys(rootAngles));
      const queue = [];

      Object.entries(rootAngles).forEach(([rootId, angleDelta]) => {
        if (!angleDelta) {
          return;
        }
        const [rootItem] = getItems([rootId]);
        if (
          !rootItem ||
          !Array.isArray(rootItem.linkedItems) ||
          rootItem.linkedItems.length === 0
        ) {
          return;
        }
        const rootElement = getItemElement(rootId);
        if (!rootElement) {
          return;
        }

        const holderCenter = {
          x: rootItem.x + rootElement.clientWidth / 2,
          y: rootItem.y + rootElement.clientHeight / 2,
        };
        const holderPreviousRotation = rootItem.rotation || 0;
        const holderNewRotation = holderPreviousRotation + angleDelta;

        rootItem.linkedItems.forEach((heldId) => {
          queue.push({
            heldId,
            holderCenter,
            holderPreviousRotation,
            holderNewRotation,
            angleDelta,
          });
        });
      });

      while (queue.length > 0) {
        const {
          heldId,
          holderCenter,
          holderPreviousRotation,
          holderNewRotation,
          angleDelta,
        } = queue.shift();
        if (processedHeld.has(heldId)) {
          continue;
        }
        processedHeld.add(heldId);

        const [heldItem] = getItems([heldId]);
        if (!heldItem) {
          continue;
        }

        const heldElement = getItemElement(heldId);
        if (!heldElement) {
          continue;
        }
        const { clientWidth, clientHeight } = heldElement;

        let offset;
        let referenceAngle;
        if (heldItem.heldOffset) {
          offset = heldItem.heldOffset;
          referenceAngle = heldItem.heldAngle || 0;
        } else {
          offset = {
            x: heldItem.x + clientWidth / 2 - holderCenter.x,
            y: heldItem.y + clientHeight / 2 - holderCenter.y,
          };
          referenceAngle = holderPreviousRotation;
        }

        const rad = ((holderNewRotation - referenceAngle) * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const newCenter = {
          x: holderCenter.x + offset.x * cos - offset.y * sin,
          y: holderCenter.y + offset.x * sin + offset.y * cos,
        };

        // Round to avoid floating point noise (e.g. cos/sin of "exact"
        // angles like 90/180 aren't exactly 0/-1/1 in IEEE-754) leaking
        // into the stored position.
        const newX = Math.round((newCenter.x - clientWidth / 2) * 100) / 100;
        const newY = Math.round((newCenter.y - clientHeight / 2) * 100) / 100;
        const newRotation = ((heldItem.rotation || 0) + angleDelta) % 360;

        heldUpdates[heldId] = { x: newX, y: newY, rotation: newRotation };

        if (
          Array.isArray(heldItem.linkedItems) &&
          heldItem.linkedItems.length > 0
        ) {
          const childHolderCenter = {
            x: newX + clientWidth / 2,
            y: newY + clientHeight / 2,
          };
          heldItem.linkedItems.forEach((childId) => {
            queue.push({
              heldId: childId,
              holderCenter: childHolderCenter,
              holderPreviousRotation: heldItem.rotation || 0,
              holderNewRotation: newRotation,
              angleDelta,
            });
          });
        }
      }

      return heldUpdates;
    },
    [getItems]
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

      batchUpdateItems(
        ids,
        () => {
          const newItem = {
            x: newX,
            y: newY,
          };
          newX += stackThickness;
          newY -= stackThickness;
          return newItem;
        },
        true
      );
      callPlaceInteractions(ids);
    },
    [batchUpdateItems, getItemListOrSelected, callPlaceInteractions]
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

      batchUpdateItems(
        ids,
        () => {
          const newItem = {
            x: newX,
            y: newY,
          };
          newX += stackThickness;
          newY -= stackThickness;
          return newItem;
        },
        true
      );
      callPlaceInteractions(ids);
    },
    [batchUpdateItems, getItemListOrSelected, callPlaceInteractions]
  );

  // Align selection to a line
  const alignAsLine = React.useCallback(
    async (itemIds, { gapBetweenItems = 5 } = {}) => {
      // Negative value is possible for 'gapBetweenItems'.
      const [ids, items] = await getItemListOrSelected(itemIds);

      let { x: newX, y: newY } = items[0];

      batchUpdateItems(
        ids,
        (item) => {
          const { clientWidth } = getItemElement(item.id);
          const newItem = {
            x: newX,
            y: newY,
          };
          newX += clientWidth + gapBetweenItems;
          return newItem;
        },
        true
      );
      callPlaceInteractions(ids);
    },
    [getItemListOrSelected, batchUpdateItems, callPlaceInteractions]
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

      batchUpdateItems(
        ids,
        (item) => {
          const { clientWidth, clientHeight } = getItemElement(item.id);
          const newItem = {
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
        },
        true
      );
      callPlaceInteractions(ids);
    },
    [getItemListOrSelected, batchUpdateItems, callPlaceInteractions]
  );

  const snapToPoint = React.useCallback(
    async (itemIds, { x, y } = {}) => {
      batchUpdateItems(
        itemIds,
        (item) => {
          const { clientWidth, clientHeight } = getItemElement(item.id);
          let newX = x - clientWidth / 2;
          let newY = y - clientHeight / 2;

          const newItem = {
            x: newX,
            y: newY,
          };
          return newItem;
        },
        true
      );
    },
    [batchUpdateItems]
  );

  const roll = React.useCallback(
    async (itemIds, { layer: layerToRoll = 0 } = {}) => {
      const [ids] = await getItemListOrSelected(itemIds);
      ids.forEach((itemId) => {
        const elem = getItemElement(itemId);
        elem.firstChild.className = "hvr-wobble-horizontal";
      });

      const randomizeValue = (item) => {
        switch (item.type) {
          case "dice":
            return {
              value: randInt(0, (item.side || 6) - 1),
            };
          case "diceImage":
          case "imageSequence":
            return {
              value: randInt(0, item.images.length - 1),
            };
          case "advancedImage": {
            const newLayers = item.layers.map((layer, index) => {
              if (index === layerToRoll) {
                return { ...layer, value: randInt(0, layer.images.length - 1) };
              }
              return layer;
            });
            return { layers: newLayers };
          }
          default:
            return {};
        }
      };

      const simulateRoll = (nextTimeout) => {
        batchUpdateItems(
          ids,
          (item) => {
            return randomizeValue(item);
          },
          true
        );
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

  const changeValue = React.useCallback(
    async (itemIds, { step = 1, layer: layerToUpdate = 0 }) => {
      const [ids] = await getItemListOrSelected(itemIds);

      const stepItem = (item, max) => {
        let { value } = item;

        if (isNaN(value)) {
          value = 0;
        }

        if (step > 0) {
          return {
            value: (value + step) % max,
          };
        } else {
          const newValue = value + step;
          return {
            value: newValue >= 0 ? newValue : max + newValue,
          };
        }
      };

      batchUpdateItems(
        ids,
        (item) => {
          switch (item.type) {
            case "dice":
              return stepItem(item, item.side || 6);
            case "diceImage":
            case "imageSequence":
              return stepItem(item, item.images.length);
            case "counter":
              return {
                value: isNaN(item.value) ? 0 : item.value + step,
              };
            case "advancedImage":
              return {
                layers: item.layers.map((layer, index) => {
                  if (index === layerToUpdate) {
                    return {
                      ...layer,
                      ...stepItem(layer, layer.images.length),
                    };
                  }
                  return layer;
                }),
              };
            default:
              return undefined;
          }
        },
        true
      );
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

      callPlaceInteractions(ids);
    },
    [getItemListOrSelected, callPlaceInteractions, swapItems]
  );

  const randomlyRotateSelectedItems = React.useCallback(
    async (itemIds, { angle, maxRotateCount = 0 }) => {
      const [ids] = await getItemListOrSelected(itemIds);
      const rootItems = getItems(ids);

      const maxRotate = maxRotateCount || Math.round(360 / angle);
      const rootAngles = Object.fromEntries(
        rootItems.map((item) => [item.id, angle * randInt(0, maxRotate)])
      );

      const heldUpdates = computeHeldRotationUpdates(rootAngles);
      const heldIds = Object.keys(heldUpdates);

      batchUpdateItems(
        [...ids, ...heldIds],
        (item) =>
          heldUpdates[item.id] || {
            rotation: ((item.rotation || 0) + (rootAngles[item.id] || 0)) % 360,
          },
        true
      );
    },
    [
      getItemListOrSelected,
      getItems,
      computeHeldRotationUpdates,
      batchUpdateItems,
    ]
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

      const angleDelta = tap ? 90 : -90;
      const heldUpdates = computeHeldRotationUpdates(
        Object.fromEntries(ids.map((id) => [id, angleDelta]))
      );
      const heldIds = Object.keys(heldUpdates);

      batchUpdateItems(
        [...ids, ...heldIds],
        (item) =>
          heldUpdates[item.id] || {
            tapped: tap,
            rotation: ((item.rotation || 0) + angleDelta) % 360,
          },
        true
      );
    },
    [getItemListOrSelected, computeHeldRotationUpdates, batchUpdateItems]
  );

  // Lock / unlock elements
  const toggleLock = React.useCallback(
    async (itemIds) => {
      const [ids] = await getItemListOrSelected(itemIds);

      batchUpdateItems(
        ids,
        (item) => ({
          locked: !item.locked,
        }),
        true
      );

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

  // Recursively collect every item held (directly or transitively) on top of
  // rootId via the "hold" mechanism's linkedItems, so hiding a holder also
  // hides its whole stack -- mirroring how rotation propagates through the
  // same chain (see computeHeldRotationUpdates above).
  const getHeldDescendantIds = React.useCallback(
    (rootId) => {
      const result = [];
      const seen = new Set([rootId]);
      const queue = [rootId];
      while (queue.length > 0) {
        const [item] = getItems([queue.shift()]);
        if (!item || !Array.isArray(item.linkedItems)) continue;
        item.linkedItems.forEach((childId) => {
          if (seen.has(childId)) return;
          seen.add(childId);
          result.push(childId);
          queue.push(childId);
        });
      }
      return result;
    },
    [getItems]
  );

  // Hide / show items for everyone outside the hider's group. hiddenByGroup
  // is only (re)stamped when hiding, so an already-hidden item keeps
  // belonging to whichever group hid it first even if a groupmate re-toggles
  // it, and toggling back to visible doesn't need to touch it at all.
  // Whatever is stacked on a toggled item (held via linkedItems) inherits
  // its new state too, so hiding a card also hides the tokens sitting on it.
  const toggleGroupHide = React.useCallback(
    async (itemIds) => {
      const [ids] = await getItemListOrSelected(itemIds);
      const items = await getItems(ids);

      const updates = {};
      const processed = new Set();

      items.forEach((item) => {
        if (!item || processed.has(item.id)) return;
        processed.add(item.id);

        const newHidden = !item.hidden;
        const newHiddenByGroup = newHidden
          ? currentUserGroupId
          : item.hiddenByGroup;
        updates[item.id] = {
          hidden: newHidden,
          hiddenByGroup: newHiddenByGroup,
        };

        getHeldDescendantIds(item.id).forEach((heldId) => {
          if (processed.has(heldId)) return;
          processed.add(heldId);
          updates[heldId] = {
            hidden: newHidden,
            hiddenByGroup: newHiddenByGroup,
          };
        });
      });

      batchUpdateItems(Object.keys(updates), (item) => updates[item.id], true);
    },
    [
      getItemListOrSelected,
      getItems,
      getHeldDescendantIds,
      batchUpdateItems,
      currentUserGroupId,
    ]
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

      batchUpdateItems(
        itemIdsToFlip,
        (item) => ({
          flipped: flip,
          unflippedFor:
            !Array.isArray(item.unflippedFor) || item.unflippedFor.length > 0
              ? null
              : item.unflippedFor,
        }),
        true
      );
      if (reverseOrder) {
        reverseItemsOrder(itemIdsToFlip);
        callPlaceInteractions(itemIds);
      }
      if (itemIdsToFlip.length) {
        playAudio(flipAudio, 0.2);
      }
    },
    [batchUpdateItems, callPlaceInteractions, getItems, reverseItemsOrder]
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

  // Rotate element, along with any items held on top of it, keeping their
  // relative position by rotating them around the holder's center.
  const rotate = React.useCallback(
    async (itemIds, { angle }) => {
      const [ids] = await getItemListOrSelected(itemIds);

      const heldUpdates = computeHeldRotationUpdates(
        Object.fromEntries(ids.map((id) => [id, angle]))
      );
      const heldIds = Object.keys(heldUpdates);

      batchUpdateItems(
        [...ids, ...heldIds],
        (item) =>
          heldUpdates[item.id] || {
            rotation: ((item.rotation || 0) + angle) % 360,
          },
        true
      );
    },
    [getItemListOrSelected, computeHeldRotationUpdates, batchUpdateItems]
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

      batchUpdateItems(
        itemIdsToFlip,
        (item) => {
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
            flipped: true,
            unflippedFor,
          };
        },
        true
      );

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
      const newItems = items.map((itemToClone) => {
        const newItem = JSON.parse(JSON.stringify(itemToClone));
        newItem.id = uid();
        delete newItem.move;
        return newItem;
      });
      pushItems(newItems, null);
    },
    [getItemListOrSelected, pushItems]
  );

  const actionMap = React.useMemo(() => {
    const actions = {
      flip: {
        action: () => toggleFlip,
        label: t("Reveal") + "/" + t("Hide"),
        shortcut: "f",
        icon: (props) => (
          <img
            {...props}
            style={{ width: "24px", height: "24px" }}
            src={flipIcon}
          />
        ),
      },
      reveal: {
        action: () => (itemIds) => setFlip(itemIds, { flip: false }),
        label: t("Reveal"),
        icon: (props) => (
          <img
            {...props}
            style={{ width: "24px", height: "24px" }}
            src={flipIcon}
          />
        ),
      },
      hide: {
        action: () => (itemIds) => setFlip(itemIds, { flip: true }),
        label: t("Hide"),
        icon: (props) => (
          <img
            {...props}
            style={{ width: "24px", height: "24px" }}
            src={flipIcon}
          />
        ),
      },
      flipSelf: {
        action: () => toggleFlipSelf,
        label: t("Reveal for me"),
        shortcut: "o",
        icon: FiEye,
      },
      revealSelf: {
        action: () => (itemIds) => setFlipSelf(itemIds, { flipSelf: true }),
        label: t("Reveal for me"),
        icon: FiEye,
      },
      hideSelf: {
        action: () => (itemIds) => setFlipSelf(itemIds, { flipSelf: false }),
        label: t("Hide for me"),
        icon: FiEye,
      },
      tap: {
        action: () => toggleTap,
        label: t("Tap") + "/" + t("Untap"),
        shortcut: "t",
        icon: (props) => (
          <img
            {...props}
            style={{ width: "24px", height: "24px" }}
            src={tapIcon}
          />
        ),
      },
      stackToCenter: {
        action: () => stackToCenter,
        label: t("Stack To Center"),
        shortcut: "c",
        multiple: true,
        icon: (props) => (
          <img
            {...props}
            style={{ width: "24px", height: "24px" }}
            src={stackToCenterIcon}
          />
        ),
      },
      stack: {
        action: () => stackToTopLeft,
        label: t("Stack To Top Left"),
        shortcut: "p",
        multiple: true,
        icon: (props) => (
          <img
            {...props}
            style={{ width: "24px", height: "24px" }}
            src={stackToTopLeftIcon}
          />
        ),
      },
      alignAsLine: {
        action: () => alignAsLine,
        label: t("Align as line"),
        multiple: true,
        icon: (props) => (
          <img
            {...props}
            style={{ width: "24px", height: "24px" }}
            src={alignAsLineIcon}
          />
        ),
      },
      alignAsSquare: {
        action: () => alignAsSquare,
        label: t("Align as square"),
        multiple: true,
        icon: (props) => (
          <img
            {...props}
            style={{ width: "24px", height: "24px" }}
            src={alignAsSquareIcon}
          />
        ),
      },
      roll: {
        action: () => roll,
        label: t("Roll"),
        shortcut: "r",
        icon: GiRollingDices,
      },
      rollLayer: {
        action: ({ layer = 0 } = {}) => (itemIds) =>
          roll(itemIds, { layer: layer }),
        label: t("Roll"),
        shortcut: "r",
        icon: GiRollingDices,
        form: ActionRollLayerForm,
      },
      nextImage: {
        action: ({ step = 1 } = {}) => (itemIds) =>
          changeValue(itemIds, { step }),
        label: t("Next"),
        shortcut: "n",
        icon: FiPlusCircle,
        form: ActionChangeImageForm,
      },
      prevImage: {
        action: ({ step = 1 } = {}) => (itemIds) =>
          changeValue(itemIds, { step: -step }),
        label: t("Previous"),
        shortcut: "p",
        icon: FiMinusCircle,
        form: ActionChangeImageForm,
      },
      nextImageForLayer: {
        action: ({ step = 1, layer = 0 } = {}) => (itemIds) =>
          changeValue(itemIds, { step, layer }),
        label: t("Next"),
        shortcut: "n",
        icon: FiPlusCircle,
        form: ActionChangeImageLayerForm,
      },
      prevImageForLayer: {
        action: ({ step = -1, layer = 0 } = {}) => (itemIds) =>
          changeValue(itemIds, { step, layer }),
        label: t("Previous"),
        shortcut: "p",
        icon: FiMinusCircle,
        form: ActionChangeImageLayerForm,
      },
      shuffle: {
        action: () => shuffleItems,
        label: t("Shuffle"),
        shortcut: "z",
        multiple: true,
        icon: (props) => (
          <img
            {...props}
            style={{ width: "24px", height: "24px" }}
            src={shuffleIcon}
          />
        ),
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
        icon: FiRotateCw,
        form: ActionRandomlyRotateForm,
      },
      randomlyRotate30: {
        action: () => (itemIds) =>
          randomlyRotateSelectedItems(itemIds, {
            angle: 30,
            maxRotateCount: 11,
          }),
        label: t("Rotate randomly 30"),
        multiple: false,
        icon: FiRotateCw,
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
        icon: FiRotateCw,
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
        icon: FiRotateCw,
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
        icon: FiRotateCw,
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
        icon: FiRotateCw,
      },
      rotate: {
        action: ({ angle = 25 } = {}) => (itemIds) =>
          rotate(itemIds, { angle }),
        label: ({ angle = 25 } = {}) => t("Rotate {{angle}}°", { angle }),
        genericLabel: t("Rotate"),
        shortcut: "r",
        icon: FiRotateCw,
        form: ActionRotateForm,
      },
      rotate30: {
        action: () => (itemIds) => rotate(itemIds, { angle: 30 }),
        label: t("Rotate 30"),
        shortcut: "r",
        icon: FiRotateCw,
      },
      rotate45: {
        action: () => (itemIds) => rotate(itemIds, { angle: 45 }),
        label: t("Rotate 45"),
        shortcut: "r",
        icon: FiRotateCw,
      },
      rotate60: {
        action: () => (itemIds) => rotate(itemIds, { angle: 60 }),
        label: t("Rotate 60"),
        shortcut: "r",
        icon: FiRotateCw,
      },
      rotate90: {
        action: () => (itemIds) => rotate(itemIds, { angle: 90 }),
        label: t("Rotate 90"),
        shortcut: "r",
        icon: FiRotateCw,
      },
      rotate180: {
        action: () => (itemIds) => rotate(itemIds, { angle: 180 }),
        label: t("Rotate 180"),
        shortcut: "r",
        icon: FiRotateCw,
      },
      clone: {
        action: () => cloneItem,
        label: t("Clone"),
        shortcut: "c",
        disableDblclick: true,
        icon: FiCopy,
      },
      lock: {
        action: () => toggleLock,
        label: t("Unlock") + "/" + t("Lock"),
        shortcut: "l",
        disableDblclick: true,
        edit: true,
        icon: FiLock,
      },
      groupHide: {
        action: () => toggleGroupHide,
        label: t("Show to everyone") + "/" + t("Hide from group"),
        shortcut: "h",
        disableDblclick: true,
        icon: FiEyeOff,
      },
      remove: {
        action: () => remove,
        label: t("Remove all"),
        shortcut: "Delete",
        edit: true,
        disableDblclick: true,
        icon: FiTrash2,
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
    changeValue,
    cloneItem,
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
    toggleGroupHide,
    toggleLock,
    toggleTap,
  ]);

  return {
    randomlyRotate: randomlyRotateSelectedItems,
    remove,
    roll,
    changeValue,
    rotate,
    computeHeldRotationUpdates,
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
