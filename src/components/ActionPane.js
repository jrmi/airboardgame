import React from "react";
import { useRecoilValue } from "recoil";
import { PanZoomRotateState } from "../components/PanZoomRotate";
import { selectedItemsAtom } from "../components/Selector";
import useItemList from "../hooks/useItemList";
import { useRecoilState } from "recoil";
import { insideClass } from "../utils";

const ActionPane = ({ children }) => {
  const panZoomRotate = useRecoilValue(PanZoomRotateState);
  const { putItemOnTop, moveSelectedItems } = useItemList();
  const [selectedItems, setSelectedItems] = useRecoilState(selectedItemsAtom);
  const wrapperRef = React.useRef(null);
  const actionRef = React.useRef({});

  const onMouseDown = (e) => {
    if (e.button === 0 && !e.altKey) {
      const { top, left } = e.currentTarget.getBoundingClientRect();
      const point = {
        x: (e.clientX - left) / panZoomRotate.scale,
        y: (e.clientY - top) / panZoomRotate.scale,
      };
      const foundElement = insideClass(e.target, "item");
      if (foundElement) {
        if (!selectedItems.includes(foundElement.id)) {
          setSelectedItems([foundElement.id]);
          putItemOnTop(foundElement.id);
        }
        actionRef.current.moving = true;
        actionRef.current.startX = point.x;
        actionRef.current.startY = point.y;
        actionRef.current.prevX = point.x;
        actionRef.current.prevY = point.y;
        actionRef.current.moving = true;
        actionRef.current.itemId = foundElement.id;
        wrapperRef.current.style.cursor = "move";
        e.stopPropagation();
      }
    }
  };

  const onMouseMouve = (e) => {
    if (actionRef.current.moving === true) {
      const { top, left } = e.currentTarget.getBoundingClientRect();
      const currentX = (e.clientX - left) / panZoomRotate.scale;
      const currentY = (e.clientY - top) / panZoomRotate.scale;
      moveSelectedItems(actionRef.current.itemId, {
        x: currentX - actionRef.current.prevX,
        y: currentY - actionRef.current.prevY,
      });
      actionRef.current.prevX = currentX;
      actionRef.current.prevY = currentY;
      e.preventDefault();
    }
  };

  const onMouseUp = () => {
    if (actionRef.current.moving === true) {
      actionRef.current = { moving: false };
      wrapperRef.current.style.cursor = "auto";
    }
  };

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMouve}
      onMouseUp={onMouseUp}
      ref={wrapperRef}
    >
      {children}
    </div>
  );
};

export default ActionPane;
