import React from 'react';
import { atom, useRecoilState } from 'recoil';

export const PanZoomRotateState = atom({
  key: 'PanZoomRotate',
  default: {
    translateX: 0,
    translateY: 0,
    scale: 1,
    rotate: 0,
  },
});

const Item = ({ children }) => {
  const [dim, setDim] = useRecoilState(PanZoomRotateState);
  const wrapperRef = React.useRef(null);
  const wrappedRef = React.useRef(null);
  const stateRef = React.useRef({
    moving: false,
  });

  const onWheel = (e) => {
    const scaleMult = (e.deltaY * dim.scale) / 20;

    setDim((prevDim) => {
      let newScale = prevDim.scale - scaleMult;

      if (newScale > 8) {
        newScale = 8;
      }

      if (newScale < 0.3) {
        newScale = 0.3;
      }

      const { top, left } = wrappedRef.current.getBoundingClientRect();
      const displayX = e.clientX - left;
      const deltaX = displayX - (displayX / dim.scale) * newScale;
      const displayY = e.clientY - top;
      const deltaY = displayY - (displayY / dim.scale) * newScale;

      return {
        ...prevDim,
        scale: newScale,
        translateX: prevDim.translateX + deltaX,
        translateY: prevDim.translateY + deltaY,
      };
    });
  };

  const onMouseDown = (e) => {
    if (e.button === 1) {
      stateRef.current.moving = true;
      stateRef.current.startX = e.clientX;
      stateRef.current.startY = e.clientY;
      stateRef.current.startTranslateX = dim.translateX;
      stateRef.current.startTranslateY = dim.translateY;
      wrapperRef.current.style.cursor = 'move';
    }
  };

  const onMouseMouve = (e) => {
    if (stateRef.current.moving) {
      const [deltaX, deltaY] = [
        e.clientX - stateRef.current.startX,
        e.clientY - stateRef.current.startY,
      ];
      setDim((prevDim) => ({
        ...prevDim,
        translateX: stateRef.current.startTranslateX + deltaX,
        translateY: stateRef.current.startTranslateY + deltaY,
      }));
    }
  };

  const onMouseUp = (e) => {
    if (e.button === 1) {
      stateRef.current.moving = false;
      wrapperRef.current.style.cursor = 'auto';
    }
  };

  const style = {
    transform: `translate(${dim.translateX}px, ${dim.translateY}px) scale(${dim.scale}) rotate(${dim.rotate}deg)`,
    transformOrigin: 'top left',
  };

  return (
    <div
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMouve}
      onMouseUp={onMouseUp}
      ref={wrapperRef}
      style={{}}
    >
      <div style={{ ...style, display: 'inline-block' }} ref={wrappedRef}>
        {children}
      </div>
    </div>
  );
};

export default Item;
