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
  const { putItemsOnTop, moveItems } = useItems();

  const setSelectedItems = useSetRecoilState(selectedItemsAtom);
  const setBoardState = useSetRecoilState(BoardStateAtom);

  const wrapperRef = React.useRef(null);
  const actionRef = React.useRef({});

  const onDragStart = useRecoilCallback(
    ({ snapshot }) => async ({ target, ctrlKey, metaKey, event }) => {
      // Allow text selection instead of moving
      if (["INPUT", "TEXTAREA"].includes(target.tagName)) return;

      const foundElement = insideClass(target, "item");

      if (foundElement && !hasClass(foundElement, "locked")) {
        event.stopPropagation();

        const selectedItems = await snapshot.getPromise(selectedItemsAtom);

        if (!selectedItems.includes(foundElement.id)) {
          if (ctrlKey || metaKey) {
            setSelectedItems((prev) => [...prev, foundElement.id]);
          } else {
            setSelectedItems([foundElement.id]);
          }
        }

        Object.assign(actionRef.current, {
          moving: true,
          onTop: false,
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
        const selectedItems = await snapshot.getPromise(selectedItemsAtom);
        const { gridSize: boardGridSize = 1 } = await snapshot.getPromise(
          BoardConfigAtom
        );
        const gridSize = boardGridSize || 1; // avoid 0 grid size

        const moveX = actionRef.current.remainX + deltaX / panZoomRotate.scale;
        const moveY = actionRef.current.remainY + deltaY / panZoomRotate.scale;
        const realMoveX = Math.round(moveX / gridSize) * gridSize;
        const realMoveY = Math.round(moveY / gridSize) * gridSize;

        if (realMoveX || realMoveY) {
          // Put items on top of others on first move
          if (!actionRef.current.onTop) {
            putItemsOnTop(selectedItems);
            actionRef.current.onTop = true;
          }

          moveItems(
            selectedItems,
            {
              x: realMoveX,
              y: realMoveY,
            },
            true,
            gridSize
          );

          setBoardState((prev) =>
            !prev.movingItems ? { ...prev, movingItems: true } : prev
          );
        }
        actionRef.current.remainX = moveX - realMoveX;
        actionRef.current.remainY = moveY - realMoveY;
      }
    },
    [moveItems, putItemsOnTop, setBoardState]
  );

  const onDragEnd = React.useCallback(() => {
    if (actionRef.current.moving) {
      actionRef.current = { moving: false };
      setBoardState((prev) => ({ ...prev, movingItems: false }));
    }
  }, [setBoardState]);

  return (
    <Gesture onDragStart={onDragStart} onDrag={onDrag} onDragEnd={onDragEnd}>
      <div ref={wrapperRef}>{children}</div>
    </Gesture>
  );
};

export default ActionPane;
