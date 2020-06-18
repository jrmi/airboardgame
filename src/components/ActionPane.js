import React from "react";
import { useRecoilValue } from "recoil";
import { PanZoomRotateState } from "../components/PanZoomRotate";
import { selectedItemsAtom } from "../components/Selector";
import { ItemListAtom } from "../components/Items";
import { useRecoilState, useSetRecoilState } from "recoil";
import { insideClass } from "../utils";
import { useC2C } from "../hooks/useC2C";

const ActionPane = ({ children }) => {
  const [c2c] = useC2C();
  const panZoomRotate = useRecoilValue(PanZoomRotateState);
  const setItemList = useSetRecoilState(ItemListAtom);
  const [selectedItems, setSelectedItems] = useRecoilState(selectedItemsAtom);
  const wrapperRef = React.useRef(null);
  const actionRef = React.useRef({});

  const putItemOnTop = React.useCallback(
    (itemIdToMove) => {
      setItemList((prevItemList) => {
        const itemToMove = prevItemList.find(({ id }) => itemIdToMove === id);
        const result = prevItemList.filter(({ id }) => itemIdToMove !== id);
        result.push(itemToMove);
        c2c.publish(
          `updateItemListOrder`,
          result.map(({ id }) => id)
        );
        return result;
      });
    },
    [setItemList, c2c]
  );

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

  const moveItem = React.useCallback(
    (itemId, posDelta) => {
      let ids = [itemId];
      if (selectedItems.includes(itemId)) {
        ids = selectedItems;
      }
      setItemList((prevList) => {
        const newItemList = prevList.map((item) => {
          if (ids.includes(item.id)) {
            const x = item.x + posDelta.x;
            const y = item.y + posDelta.y;
            const newItem = { ...item, x, y };
            return newItem;
          }
          return item;
        });
        c2c.publish(`selectedItemsMove`, { itemIds: ids, move: posDelta });
        return newItemList;
      });
    },
    [setItemList, selectedItems, c2c]
  );

  const onMouseMouve = (e) => {
    if (actionRef.current.moving === true) {
      const { top, left } = e.currentTarget.getBoundingClientRect();
      const currentX = (e.clientX - left) / panZoomRotate.scale;
      const currentY = (e.clientY - top) / panZoomRotate.scale;
      moveItem(actionRef.current.itemId, {
        x: currentX - actionRef.current.prevX,
        y: currentY - actionRef.current.prevY,
      });
      actionRef.current.prevX = currentX;
      actionRef.current.prevY = currentY;
      e.preventDefault();
    }
  };

  const onMouseUp = (e) => {
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
      style={{}}
      ref={wrapperRef}
    >
      {children}
    </div>
  );
};

export default ActionPane;
