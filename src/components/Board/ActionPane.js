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

import { useGesture } from "react-use-gesture";

const ActionPane = ({ children }) => {
  const { putItemsOnTop, moveItems } = useItems();

  const setSelectedItems = useSetRecoilState(selectedItemsAtom);
  const setBoardState = useSetRecoilState(BoardStateAtom);

  const wrapperRef = React.useRef(null);
  const actionRef = React.useRef({});

  const onMouseDown = useRecoilCallback(
    ({ snapshot }) => async (e) => {
      const {
        event: { target, currentTarget },
        event,
        ctrlKey,
        metaKey,
        xy: [clientX, clientY],
        buttons,
      } = e;
      if (buttons === 1 /*&& !e.altKey*/) {
        // Allow text selection instead of moving
        if (["INPUT", "TEXTAREA"].includes(target.tagName)) {
          event.stopPropagation();
          return;
        }

        const { top, left } = currentTarget.getBoundingClientRect();

        const foundElement = insideClass(target, "item");

        if (foundElement && !hasClass(foundElement, "locked")) {
          event.stopPropagation();
          const panZoomRotate = await snapshot.getPromise(PanZoomRotateAtom);
          const selectedItems = await snapshot.getPromise(selectedItemsAtom);

          const point = {
            x: (clientX - left) / panZoomRotate.scale,
            y: (clientY - top) / panZoomRotate.scale,
          };

          if (!selectedItems.includes(foundElement.id)) {
            if (ctrlKey || metaKey) {
              setSelectedItems((prev) => [...prev, foundElement.id]);
            } else {
              setSelectedItems([foundElement.id]);
            }
          }

          actionRef.current.moving = true;
          actionRef.current.onTop = false;
          actionRef.current.startX = point.x;
          actionRef.current.startY = point.y;
          actionRef.current.prevX = point.x;
          actionRef.current.prevY = point.y;
          actionRef.current.itemId = foundElement.id;
          actionRef.current.currentBoardRect = { top, left };

          wrapperRef.current.style.cursor = "move";
        }
      }
    },
    [setSelectedItems]
  );

  const onMouseMove = useRecoilCallback(
    ({ snapshot }) => async (e) => {
      if (actionRef.current.moving) {
        const {
          xy: [clientX, clientY],
        } = e;

        const { top, left } = actionRef.current.currentBoardRect;

        const panZoomRotate = await snapshot.getPromise(PanZoomRotateAtom);
        const selectedItems = await snapshot.getPromise(selectedItemsAtom);
        const { gridSize: boardGridSize = 1 } = await snapshot.getPromise(
          BoardConfigAtom
        );
        const gridSize = boardGridSize || 1; // avoid 0 grid size

        const currentX = (clientX - left) / panZoomRotate.scale;
        const currentY = (clientY - top) / panZoomRotate.scale;

        let realMoveX =
          Math.round((currentX - actionRef.current.prevX) / gridSize) *
          gridSize;
        let realMoveY =
          Math.round((currentY - actionRef.current.prevY) / gridSize) *
          gridSize;

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

          actionRef.current.prevX += realMoveX;
          actionRef.current.prevY += realMoveY;
          setBoardState((prev) =>
            !prev.movingItems ? { ...prev, movingItems: true } : prev
          );
        }
      }
    },
    [moveItems, putItemsOnTop, setBoardState]
  );

  const onMouseUp = React.useCallback(
    (e) => {
      if (actionRef.current.moving) {
        actionRef.current = { moving: false };
        wrapperRef.current.style.cursor = "auto";
        setBoardState((prev) => ({ ...prev, movingItems: false }));
      }
    },
    [setBoardState]
  );

  useGesture(
    { onDrag: onMouseMove, onDragStart: onMouseDown, onDragEnd: onMouseUp },
    { domTarget: wrapperRef }
  );

  return (
    <div style={{ touchAction: "none" }} ref={wrapperRef}>
      {children}
    </div>
  );
};

export default ActionPane;
