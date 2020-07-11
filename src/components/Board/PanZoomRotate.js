import React from "react";

import { atom, useRecoilState, useRecoilValue } from "recoil";
import { BoardConfigAtom } from "./";
import { isMacOS } from "../../deviceInfos";

import styled from "styled-components";

import debounce from "lodash.debounce";

export const PanZoomRotateAtom = atom({
  key: "PanZoomRotate",
  default: {
    translateX: 0,
    translateY: 0,
    scale: 1,
    rotate: 0,
    centerX: 0,
    centerY: 0,
  },
});

const Pane = styled.div.attrs(({ translateX, translateY, scale, rotate }) => ({
  style: {
    transform: `translate(${translateX}px, ${translateY}px) scale(${scale}) rotate(${rotate}deg)`,
  },
  className: "board-pane",
}))`
  transform-origin: top left;
  display: inline-block;
`;

const PanZoomRotate = ({ children }) => {
  const [dim, setDim] = useRecoilState(PanZoomRotateAtom);
  const config = useRecoilValue(BoardConfigAtom);

  const wrapperRef = React.useRef(null);
  const wrappedRef = React.useRef(null);
  const scaleRef = React.useRef(dim.scale);
  scaleRef.current = dim.scale;
  const stateRef = React.useRef({
    moving: false,
  });

  // Center board on game loading
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
    // On a trackpad, the pinch gesture sets the ctrlKey to true.
    // In that situation, we want to use the custom scaling below, not the browser default zoom.
    // Hence in this situation we avoid to return immediately.
    if (e.altKey || (e.ctrlKey && !isMacOS())) {
      return;
    }

    // Made the scale multiplicator Mac specific, as the default one was zooming way too much on each gesture.
    const scaleMult =
      (e.deltaY < 0 ? -3 : 3 * dim.scale) / (isMacOS() ? 100 : 20);

    setDim((prevDim) => {
      // On a trackpad, the pinch and pan events are differentiated by the crtlKey value.
      // On a pinch gesture, the ctrlKey is set to true, so we want to have a scaling effect.
      // If we are only moving the fingers in the same direction, a pan is needed.
      // Ref: https://medium.com/@auchenberg/detecting-multi-touch-trackpad-gestures-in-javascript-a2505babb10e
      if (isMacOS() && !e.ctrlKey) {
        return {
          ...prevDim,
          translateX: prevDim.translateX - 2 * e.deltaX,
          translateY: prevDim.translateY - 2 * e.deltaY,
        };
      }

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

  // Debounce set center to avoid too many render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateCenter = React.useCallback(
    debounce(() => {
      const { innerHeight, innerWidth } = window;
      setDim((prevDim) => {
        return {
          ...prevDim,
          centerX: (innerWidth / 2 - prevDim.translateX) / prevDim.scale,
          centerY: (innerHeight / 2 - prevDim.translateY) / prevDim.scale,
        };
      });
    }, 300),
    [setDim]
  );

  React.useEffect(() => {
    debouncedUpdateCenter();
  }, [debouncedUpdateCenter, dim.translateX, dim.translateY]);

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
