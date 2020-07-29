import React from "react";

import { PanZoomRotateAtom } from "./PanZoomRotate";
import { selectedItemsAtom } from "./Selector";
import { useItems } from "./Items";
import { useSetRecoilState, useRecoilCallback } from "recoil";
import { insideClass, hasClass } from "../../utils";

const ActionPane = ({ children }) => {
  const { putItemsOnTop, moveItems } = useItems();
  const setSelectedItems = useSetRecoilState(selectedItemsAtom);
  const wrapperRef = React.useRef(null);
  const actionRef = React.useRef({});

  const onMouseDown = useRecoilCallback(
    ({ snapshot }) => async (e) => {
      if (e.button === 0 && !e.altKey) {
        // Allow text selection instead of moving
        if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;

        const { top, left } = e.currentTarget.getBoundingClientRect();
        const { clientX, clientY, ctrlKey, metaKey } = e;

        const foundElement = insideClass(e.target, "item");

        const panZoomRotate = await snapshot.getPromise(PanZoomRotateAtom);
        const selectedItems = await snapshot.getPromise(selectedItemsAtom);

        const point = {
          x: (clientX - left) / panZoomRotate.scale,
          y: (clientY - top) / panZoomRotate.scale,
        };

        if (foundElement && !hasClass(foundElement, "locked")) {
          let selectedItemsToMove = selectedItems;

          if (!selectedItems.includes(foundElement.id)) {
            if (ctrlKey || metaKey) {
              setSelectedItems((prev) => [...prev, foundElement.id]);
              selectedItemsToMove = [...selectedItems, foundElement.id];
            } else {
              setSelectedItems([foundElement.id]);
              selectedItemsToMove = [foundElement.id];
            }
          }

          putItemsOnTop(selectedItemsToMove);

          actionRef.current.moving = true;
          actionRef.current.startX = point.x;
          actionRef.current.startY = point.y;
          actionRef.current.prevX = point.x;
          actionRef.current.prevY = point.y;
          actionRef.current.moving = true;
          actionRef.current.itemId = foundElement.id;

          wrapperRef.current.style.cursor = "move";
        }
      }
    },
    [putItemsOnTop, setSelectedItems]
  );

  const onMouseMouve = useRecoilCallback(
    ({ snapshot }) => async (e) => {
      if (actionRef.current.moving) {
        const { top, left } = e.currentTarget.getBoundingClientRect();
        const { clientX, clientY } = e;

        const panZoomRotate = await snapshot.getPromise(PanZoomRotateAtom);
        const selectedItems = await snapshot.getPromise(selectedItemsAtom);

        const currentX = (clientX - left) / panZoomRotate.scale;
        const currentY = (clientY - top) / panZoomRotate.scale;

        moveItems(selectedItems, {
          x: currentX - actionRef.current.prevX,
          y: currentY - actionRef.current.prevY,
        });

        actionRef.current.prevX = currentX;
        actionRef.current.prevY = currentY;
      }
    },
    [moveItems]
  );

  const onMouseUp = React.useCallback(() => {
    if (actionRef.current.moving) {
      actionRef.current = { moving: false };
      wrapperRef.current.style.cursor = "auto";
    }
  }, []);

  React.useEffect(() => {
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseUp]);

  return (
    <div onMouseDown={onMouseDown} onMouseMove={onMouseMouve} ref={wrapperRef}>
      {children}
    </div>
  );
};

export default ActionPane;
