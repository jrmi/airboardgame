import React from 'react';
import { atom, useRecoilValue } from 'recoil';
import { PanZoomRotateState } from '../components/PanZoomRotate';
import { ItemListAtom } from '../components/Items';
import { useRecoilState } from 'recoil';
import { insideClass, isPointInsideRect } from '../utils';

export const selectedItemsAtom = atom({
  key: 'selectedItems',
  default: [],
});

const findSelected = (items, rect) => {
  return items.filter((item) => {
    return (
      !item.locked &&
      isPointInsideRect({ x: item.x, y: item.y }, rect) &&
      isPointInsideRect(
        { x: item.x + item.actualWidth, y: item.y + item.actualHeight },
        rect
      )
    );
  });
};

const Selector = ({ children }) => {
  const panZoomRotate = useRecoilValue(PanZoomRotateState);
  const itemList = useRecoilValue(ItemListAtom);
  const [selected, setSelected] = useRecoilState(selectedItemsAtom);
  const [selector, setSelector] = React.useState({});
  const wrapperRef = React.useRef(null);
  const stateRef = React.useRef({
    moving: false,
  });

  const onMouseDown = (e) => {
    if (e.button === 0 && !insideClass(e.target, 'item')) {
      const { top, left } = e.currentTarget.getBoundingClientRect();
      const displayX = (e.clientX - left) / panZoomRotate.scale;
      const displayY = (e.clientY - top) / panZoomRotate.scale;
      stateRef.current.moving = true;
      stateRef.current.startX = displayX;
      stateRef.current.startY = displayY;
      setSelector({ ...stateRef.current });
      wrapperRef.current.style.cursor = 'crosshair';
    } else {
      if (selected.length) {
        /* Should remove selection if clic another item */
        /*setSelected([])*/
      }
    }
  };

  const onMouseMouve = (e) => {
    if (stateRef.current.moving) {
      if (selected.length) setSelected([]);
      const { top, left } = e.currentTarget.getBoundingClientRect();
      const currentX = (e.clientX - left) / panZoomRotate.scale;
      const currentY = (e.clientY - top) / panZoomRotate.scale;
      if (currentX > stateRef.current.startX) {
        stateRef.current.left = stateRef.current.startX;
        stateRef.current.width = currentX - stateRef.current.startX;
      } else {
        stateRef.current.left = currentX;
        stateRef.current.width = -currentX + stateRef.current.startX;
      }
      if (currentY > stateRef.current.startY) {
        stateRef.current.top = stateRef.current.startY;
        stateRef.current.height = currentY - stateRef.current.startY;
      } else {
        stateRef.current.top = currentY;
        stateRef.current.height = -currentY + stateRef.current.startY;
      }
      setSelector({ ...stateRef.current });
      e.preventDefault();
    }
  };

  const onMouseUp = (e) => {
    if (e.button === 0 && stateRef.current.moving) {
      const selected = findSelected(itemList, stateRef.current).map(
        ({ id }) => id
      );
      setSelected(selected);
      stateRef.current = { moving: false };
      setSelector({ ...stateRef.current });
      wrapperRef.current.style.cursor = 'auto';
    }
  };

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMouve}
      onMouseUp={onMouseUp}
      ref={wrapperRef}
      style={{}}
    >
      {selector.moving && (
        <div
          style={{
            zIndex: 100,
            position: 'absolute',
            backgroundColor: '#FF000050',
            top: selector.top,
            left: selector.left,
            height: selector.height,
            width: selector.width,
          }}
        ></div>
      )}
      {children}
    </div>
  );
};

export default Selector;
