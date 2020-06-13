import React from 'react';
import { atom, useRecoilValue } from 'recoil';
import { PanZoomRotateState } from '../components/PanZoomRotate';
import { selectedItemsAtom } from '../components/Selector';
import { ItemListAtom } from '../components/Items';
import { useRecoilState } from 'recoil';
import findlast from 'lodash.findlast';
import { insideClass, isPointInsideRect, isPointInsideItem } from '../utils';

const ActionPane = ({ children }) => {
  const panZoomRotate = useRecoilValue(PanZoomRotateState);
  const [itemList, setItemList] = useRecoilState(ItemListAtom);
  const [selectedItems, setSelectedItems] = useRecoilState(selectedItemsAtom);
  const wrapperRef = React.useRef(null);
  const actionRef = React.useRef({});

  const onMouseDown = (e) => {
    if (e.button === 0) {
      const { top, left } = e.currentTarget.getBoundingClientRect();
      const point = {
        x: (e.clientX - left) / panZoomRotate.scale,
        y: (e.clientY - top) / panZoomRotate.scale,
      };
      const foundItem = findlast(itemList, (item) => {
        return !item.locked && isPointInsideItem(point, item);
      });
      if (foundItem) {
        actionRef.current.moving = true;
        actionRef.current.prevX = point.x;
        actionRef.current.prevY = point.y;
        actionRef.current.item = foundItem;
        actionRef.current.moving = true;
        wrapperRef.current.style.cursor = 'move';
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
        return prevList.map((item) => {
          if (ids.includes(item.id)) {
            const x = item.x + posDelta.x;
            const y = item.y + posDelta.y;
            return { ...item, x, y };
          }
          return item;
        });
      });
    },
    [setItemList, selectedItems]
  );

  const onMouseMouve = (e) => {
    if (actionRef.current.moving === true) {
      const { top, left } = e.currentTarget.getBoundingClientRect();
      const currentX = (e.clientX - left) / panZoomRotate.scale;
      const currentY = (e.clientY - top) / panZoomRotate.scale;
      moveItem(actionRef.current.item.id, {
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
      wrapperRef.current.style.cursor = 'auto';
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
