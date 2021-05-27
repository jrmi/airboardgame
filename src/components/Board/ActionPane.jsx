import React from "react";

import {
  BoardStateAtom,
  selectedItemsAtom,
  PanZoomRotateAtom,
  BoardConfigAtom,
} from "./";
import { useItems } from "./Items";
import { useSetRecoilState, useRecoilCallback } from "recoil";
import { insideClass, hasClass } from "../../utils";

import Gesture from "./Gesture";

const ActionPane = ({ children }) => {
  const { moveItems, placeItems } = useItems();

  const setSelectedItems = useSetRecoilState(selectedItemsAtom);
  const setBoardState = useSetRecoilState(BoardStateAtom);

  const wrapperRef = React.useRef(null);
  const actionRef = React.useRef({});

  // Use ref as pointer events are faster than react state management
  const selectedItemRef = React.useRef({
    items: [],
  });

  const onDragStart = useRecoilCallback(
    ({ snapshot }) => async ({ target, ctrlKey, metaKey, event }) => {
      // Allow text selection instead of moving
      if (["INPUT", "TEXTAREA"].includes(target.tagName)) return;

      const foundElement = insideClass(target, "item");

      if (foundElement && !hasClass(foundElement, "locked")) {
        event.stopPropagation();

        const selectedItems = await snapshot.getPromise(selectedItemsAtom);

        selectedItemRef.current.items = selectedItems;

        if (!selectedItems.includes(foundElement.id)) {
          if (ctrlKey || metaKey) {
            selectedItemRef.current.items = [...selectedItems, foundElement.id];
            setSelectedItems((prev) => [...prev, foundElement.id]);
          } else {
            selectedItemRef.current.items = [foundElement.id];
            setSelectedItems([foundElement.id]);
          }
        }

        Object.assign(actionRef.current, {
          moving: true,
          remainX: 0,
          remainY: 0,
        });
      }
    },
    [setSelectedItems]
  );

  const onDrag = useRecoilCallback(
    ({ snapshot }) => async ({ deltaX, deltaY }) => {
      if (actionRef.current.moving) {
        const panZoomRotate = await snapshot.getPromise(PanZoomRotateAtom);
        const moveX = actionRef.current.remainX + deltaX / panZoomRotate.scale;
        const moveY = actionRef.current.remainY + deltaY / panZoomRotate.scale;

        moveItems(
          selectedItemRef.current.items,
          {
            x: moveX,
            y: moveY,
          },
          true
        );

        setBoardState((prev) =>
          !prev.movingItems ? { ...prev, movingItems: true } : prev
        );
      }
    },
    [moveItems, setBoardState]
  );

  const onDragEnd = useRecoilCallback(
    ({ snapshot }) => async () => {
      if (actionRef.current.moving) {
        const { gridSize: boardGridSize = 1 } = await snapshot.getPromise(
          BoardConfigAtom
        );
        const gridSize = boardGridSize || 1; // avoid 0 grid size

        actionRef.current = { moving: false };
        placeItems(selectedItemRef.current.items, {
          type: "grid",
          size: gridSize,
        });
        setBoardState((prev) => ({ ...prev, movingItems: false }));
      }
    },
    [placeItems, setBoardState]
  );

  return (
    <Gesture onDragStart={onDragStart} onDrag={onDrag} onDragEnd={onDragEnd}>
      <div ref={wrapperRef}>{children}</div>
    </Gesture>
  );
};

export default ActionPane;
