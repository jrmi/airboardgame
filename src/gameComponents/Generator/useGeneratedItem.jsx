import React from "react";
import { useItemActions, useItemInteraction, useUsers } from "react-sync-board";

import { uid, getItemElement } from "../../utils";
import { isItemCenterInsideElement } from "../../utils/item";

/**
 * Keeps the generated item owned by a generator in sync with its owner.
 *
 * The owner remains the source of truth for currentItemId and linkedItems;
 * refs are used here only to make asynchronous board interactions safe.
 */
export const useGeneratedItem = ({
  id,
  item,
  currentItemId,
  setState,
  generatorElement,
  centerRef,
}) => {
  const { isSpaceMaster: isMaster } = useUsers();
  const { register: registerPlace } = useItemInteraction("place");
  const { register: registerDelete } = useItemInteraction("delete");
  const { pushItem, getItems, batchUpdateItems, removeItems } =
    useItemActions();

  const aliveRef = React.useRef(true);
  const currentItemRef = React.useRef(currentItemId || null);
  const pendingGeneratedItemRef = React.useRef(null);
  const pendingGeneratedItemPositionRef = React.useRef(null);
  const pendingGeneratedItemTimeoutRef = React.useRef(null);
  const ignoredDeleteIdsRef = React.useRef(new Set());
  const addingItemRef = React.useRef(false);

  React.useEffect(() => {
    // React StrictMode runs a setup/cleanup/setup cycle in development.
    // Restore the mounted state during every setup, not only on first render.
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      clearTimeout(pendingGeneratedItemTimeoutRef.current);
    };
  }, []);

  // Do not overwrite a freshly created local id during the render in which
  // the board has not propagated setState yet. Lifecycle operations clear the
  // ref themselves before clearing the persisted owner fields.
  if (currentItemId) {
    currentItemRef.current = currentItemId;
  }

  const updateOwner = React.useCallback(
    (nextCurrentItemId) => {
      if (!aliveRef.current || !setState) {
        return;
      }
      setState((previous) => ({
        ...previous,
        currentItemId: nextCurrentItemId || undefined,
        linkedItems: nextCurrentItemId ? [nextCurrentItemId] : [],
      }));
    },
    [setState]
  );

  const addItem = React.useCallback(async () => {
    if (
      !aliveRef.current ||
      !isMaster ||
      !item?.type ||
      addingItemRef.current
    ) {
      return null;
    }

    addingItemRef.current = true;
    const newItemId = uid();
    let pushed = false;

    try {
      const [owner] = await getItems([id]);
      if (!aliveRef.current || !owner?.item?.type) {
        return null;
      }

      currentItemRef.current = newItemId;
      pendingGeneratedItemRef.current = newItemId;
      const generatedPosition = {
        x: owner.x + (centerRef?.current?.left || 0) + 3,
        y: owner.y + (centerRef?.current?.top || 0) + 3,
      };
      pendingGeneratedItemPositionRef.current = generatedPosition;
      clearTimeout(pendingGeneratedItemTimeoutRef.current);
      pendingGeneratedItemTimeoutRef.current = setTimeout(() => {
        if (pendingGeneratedItemRef.current === newItemId) {
          pendingGeneratedItemRef.current = null;
          pendingGeneratedItemPositionRef.current = null;
        }
      }, 1000);
      updateOwner(newItemId);

      await pushItem({
        ...owner.item,
        ...generatedPosition,
        layer: (owner.layer ?? 0) + 1,
        editable: false,
        id: newItemId,
      });
      pushed = true;
      return newItemId;
    } finally {
      addingItemRef.current = false;
      if (!pushed && currentItemRef.current === newItemId) {
        currentItemRef.current = null;
        pendingGeneratedItemRef.current = null;
        pendingGeneratedItemPositionRef.current = null;
        clearTimeout(pendingGeneratedItemTimeoutRef.current);
        updateOwner(null);
      }
    }
  }, [centerRef, getItems, id, isMaster, item?.type, pushItem, updateOwner]);

  const onPlaceItem = React.useCallback(
    async (itemIds) => {
      if (!isMaster || !aliveRef.current) {
        return;
      }

      const pendingId = pendingGeneratedItemRef.current;
      if (pendingId && itemIds.includes(pendingId)) {
        const generatedPosition = pendingGeneratedItemPositionRef.current;
        pendingGeneratedItemRef.current = null;
        pendingGeneratedItemPositionRef.current = null;
        clearTimeout(pendingGeneratedItemTimeoutRef.current);
        if (generatedPosition) {
          // Insertion goes through placeItems in react-sync-board, which
          // applies the item's grid. Put only this newly generated item back
          // at the exact generator position; later user placements still snap.
          batchUpdateItems([pendingId], (generatedItem) => ({
            ...generatedItem,
            ...generatedPosition,
          }));
        }
        return;
      }

      const generatedId = currentItemRef.current;
      const ownerWasPlaced = itemIds.includes(id);
      if (!generatedId || (!itemIds.includes(generatedId) && !ownerWasPlaced)) {
        return;
      }

      const [owner] = await getItems([id]);
      if (!aliveRef.current || !owner) {
        return;
      }

      if (
        itemIds.includes(generatedId) &&
        !ownerWasPlaced &&
        generatorElement?.current
      ) {
        const generatedElement = getItemElement(generatedId);
        if (
          generatedElement &&
          !isItemCenterInsideElement(generatedElement, generatorElement.current)
        ) {
          batchUpdateItems([generatedId], (generatedItem) => {
            const editableItem = { ...generatedItem, layer: owner.layer };
            delete editableItem.editable;
            return editableItem;
          });
          await addItem();
        }
      } else if (ownerWasPlaced && !generatedId) {
        await addItem();
      }
    },
    [addItem, batchUpdateItems, getItems, generatorElement, id, isMaster]
  );

  const onDeleteItem = React.useCallback(
    async (itemIds) => {
      if (!isMaster || !aliveRef.current) {
        return;
      }
      const generatedId = currentItemRef.current;
      if (!generatedId || !itemIds.includes(generatedId)) {
        return;
      }
      if (ignoredDeleteIdsRef.current.delete(generatedId)) {
        return;
      }
      currentItemRef.current = null;
      updateOwner(null);
      await addItem();
    },
    [addItem, isMaster, updateOwner]
  );

  // Empty type means an intentionally empty generator. Remove the old child
  // and consume its delete event so it cannot immediately be recreated.
  React.useEffect(() => {
    if (!isMaster || item?.type) {
      return;
    }
    const generatedId = currentItemRef.current;
    if (!generatedId) {
      if (currentItemId || item?.linkedItems?.length) {
        updateOwner(null);
      }
      return;
    }
    currentItemRef.current = null;
    ignoredDeleteIdsRef.current.add(generatedId);
    updateOwner(null);
    removeItems([generatedId]);
  }, [
    currentItemId,
    isMaster,
    item?.linkedItems,
    item?.type,
    removeItems,
    updateOwner,
  ]);

  // A changed type invalidates the old generated item. Ignore its delete
  // callback, then create exactly one child for the new type.
  React.useEffect(() => {
    if (!isMaster || !item?.type || !currentItemRef.current) {
      return;
    }

    let cancelled = false;
    const synchronizeType = async () => {
      const generatedId = currentItemRef.current;
      const [generatedItem] = await getItems([generatedId]);
      if (cancelled || !aliveRef.current || !generatedItem) {
        return;
      }
      if (generatedItem.type !== item.type) {
        currentItemRef.current = null;
        ignoredDeleteIdsRef.current.add(generatedId);
        updateOwner(null);
        await removeItems([generatedId]);
        if (!cancelled) {
          await addItem();
        }
      }
    };
    synchronizeType();
    return () => {
      cancelled = true;
    };
  }, [addItem, getItems, isMaster, item?.type, removeItems, updateOwner]);

  // Synchronize the template into the generated item only on the master,
  // after the type replacement check above has had a chance to run.
  React.useEffect(() => {
    if (isMaster && item?.type && currentItemRef.current) {
      batchUpdateItems([currentItemRef.current], (previous) => {
        // Leave a stale child untouched until the type-replacement effect
        // removes it. Otherwise an asynchronous getItems call could observe
        // the new type and incorrectly keep the old child alive.
        if (previous.type && previous.type !== item.type) {
          return previous;
        }
        return {
          ...previous,
          ...item,
        };
      });
    }
  }, [batchUpdateItems, isMaster, item]);

  React.useEffect(() => {
    if (isMaster && item?.type && !currentItemRef.current) {
      addItem();
    }
  }, [addItem, isMaster, item?.type]);

  React.useEffect(() => {
    const unregister = [
      registerPlace(onPlaceItem),
      registerDelete(onDeleteItem),
    ];
    return () => unregister.forEach((callback) => callback?.());
  }, [onDeleteItem, onPlaceItem, registerDelete, registerPlace]);

  return {
    currentItemId: currentItemRef.current,
    currentItemRef,
  };
};

export default useGeneratedItem;
