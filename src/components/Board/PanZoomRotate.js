import React from "react";
import { atom, useRecoilState, useRecoilValue } from "recoil";
import { BoardConfigAtom } from "./game/atoms";

import styled from "styled-components";

export const PanZoomRotateState = atom({
  key: "PanZoomRotate",
  default: {
    translateX: 0,
    translateY: 0,
    scale: 1,
    rotate: 0,
  },
});

const Pane = styled.div.attrs(({ translateX, translateY, scale, rotate }) => ({
  style: {
    transform: `translate(${translateX}px, ${translateY}px) scale(${scale}) rotate(${rotate}deg)`,
  },
}))`
  transform-origin: top left;
  display: inline-block;
`;

const PanZoomRotate = ({ children }) => {
  const [dim, setDim] = useRecoilState(PanZoomRotateState);
  const config = useRecoilValue(BoardConfigAtom);

  const wrapperRef = React.useRef(null);
  const wrappedRef = React.useRef(null);
  const scaleRef = React.useRef(dim.scale);
  scaleRef.current = dim.scale;
  const stateRef = React.useRef({
    moving: false,
  });

  /**
   * Center board on game loading
   */
  React.useEffect(() => {
    const { innerHeight, innerWidth } = window;
    setDim((prev) => ({
      ...prev,
      scale: config.scale,
      translateX: innerWidth / 2 - (config.size / 2) * config.scale,
      translateY: innerHeight / 2 - (config.size / 2) * config.scale,
    }));
  }, [config, setDim]);

  const onWheel = (e) => {
    if (e.altKey || e.ctrlKey) {
      return;
    }

    const scaleMult = (e.deltaY * dim.scale) / 20;

    setDim((prevDim) => {
      let newScale = scaleRef.current - scaleMult;

      if (newScale > 8) {
        newScale = 8;
      }

      if (newScale < 0.3) {
        newScale = 0.3;
      }

      scaleRef.current = newScale;

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
    if (e.button === 1 || e.altKey) {
      stateRef.current.moving = true;
      stateRef.current.startX = e.clientX;
      stateRef.current.startY = e.clientY;
      stateRef.current.startTranslateX = dim.translateX;
      stateRef.current.startTranslateY = dim.translateY;
      wrapperRef.current.style.cursor = "move";
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

  const onMouseUp = React.useCallback(() => {
    stateRef.current.moving = false;
    wrapperRef.current.style.cursor = "auto";
  }, []);

  React.useEffect(() => {
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseUp]);

  return (
    <div
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMouve}
      onMouseUp={onMouseUp}
      ref={wrapperRef}
    >
      <Pane {...dim} ref={wrappedRef}>
        {children}
      </Pane>
    </div>
  );
};

export default PanZoomRotate;
