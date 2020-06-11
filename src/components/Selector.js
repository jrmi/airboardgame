import React from 'react';
import { atom, useRecoilValue } from 'recoil';
import { PanZoomRotateState } from '../components/PanZoomRotate';

export const selectedItemsAtom = atom({
  key: 'selectedItems',
  default: [],
});

/**
 * Check if element or parent has className.
 * @param {DOMElement} element
 * @param {string} className
 */
const insideClass = (element, className) => {
  if (element.className === className) return true;
  return element.parentNode && insideClass(element.parentNode, className);
};

const Selector = ({ children }) => {
  const panZoomRotate = useRecoilValue(PanZoomRotateState);
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
    }
  };

  const onMouseMouve = (e) => {
    if (stateRef.current.moving) {
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
    }
  };

  const onMouseUp = (e) => {
    if (e.button === 0) {
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
