import React from "react";

import { atom, useRecoilState, useRecoilValue } from "recoil";
import { BoardConfigAtom } from "./";
import { isMacOS } from "../../deviceInfos";
import { insideClass } from "../../utils/";

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
  const [scale, setScale] = React.useState({
    scale: config.scale,
    x: 0,
    y: 0,
  });

  const wrapperRef = React.useRef(null);
  const wrappedRef = React.useRef(null);
  const stateRef = React.useRef({
    moving: false,
  });

  // React on scale change
  React.useEffect(() => {
    setDim((prevDim) => {
      const { top, left } = wrappedRef.current.getBoundingClientRect();
      const displayX = scale.x - left;
      const deltaX = displayX - (displayX / prevDim.scale) * scale.scale;
      const displayY = scale.y - top;
      const deltaY = displayY - (displayY / prevDim.scale) * scale.scale;

      return {
        ...prevDim,
        scale: scale.scale,
        translateX: prevDim.translateX + deltaX,
        translateY: prevDim.translateY + deltaY,
      };
    });
  }, [scale, setDim]);

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

    const { deltaX, deltaY, clientX, clientY } = e;

    // On a trackpad, the pinch and pan events are differentiated by the crtlKey value.
    // On a pinch gesture, the ctrlKey is set to true, so we want to have a scaling effect.
    // If we are only moving the fingers in the same direction, a pan is needed.
    // Ref: https://medium.com/@auchenberg/detecting-multi-touch-trackpad-gestures-in-javascript-a2505babb10e
    if (isMacOS() && !e.ctrlKey) {
      setDim((prevDim) => {
        return {
          ...prevDim,
          translateX: prevDim.translateX - 2 * deltaX,
          translateY: prevDim.translateY - 2 * deltaY,
        };
      });
    } else {
      setScale((prevScale) => {
        // Made the scale multiplicator Mac specific, as the default one was zooming way too much on each gesture.
        const scaleMult =
          (deltaY < 0 ? -3 : 3 * prevScale.scale) / (isMacOS() ? 50 : 20);
        let newScale = prevScale.scale - scaleMult;

        if (newScale > 8) {
          newScale = 12;
        }

        if (newScale < 0.3) {
          newScale = 0.3;
        }
        return {
          scale: newScale,
          x: clientX,
          y: clientY,
        };
      });
    }
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

  React.useEffect(() => {
    // Chrome-related issue.
    // Making the wheel event non-passive, which allows to use preventDefault() to prevent
    // the browser original zoom  and therefore allowing our custom one.
    // More detail at https://github.com/facebook/react/issues/14856
    const cancelWheel = (event) => {
      if (insideClass(event.target, "board")) event.preventDefault();
    };

    document.body.addEventListener("wheel", cancelWheel, { passive: false });

    return () => {
      document.body.removeEventListener("wheel", cancelWheel);
    };
  }, []);

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
