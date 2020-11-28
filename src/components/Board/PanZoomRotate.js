import React from "react";

import {
  atom,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from "recoil";
import { BoardConfigAtom, BoardStateAtom } from "./";
import { insideClass } from "../../utils/";

import usePrevious from "../../hooks/usePrevious";

import styled from "styled-components";

import debounce from "lodash.debounce";

import { useGesture } from "react-use-gesture";

import { isMacOS } from "../../utils/deviceInfos";

const TOLERANCE = 100;

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

const PanZoomRotate = ({ children, moveFirst }) => {
  const [dim, setDim] = useRecoilState(PanZoomRotateAtom);
  const config = useRecoilValue(BoardConfigAtom);
  const setBoardState = useSetRecoilState(BoardStateAtom);
  const prevDim = usePrevious(dim);

  const [scale, setScale] = React.useState({
    scale: config.scale,
    x: 0,
    y: 0,
  });

  const wrapperRef = React.useRef(null);
  const wrappedRef = React.useRef(null);

  // React on scale change
  React.useLayoutEffect(() => {
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
  }, [config.size, config.scale, setDim]);

  // Keep board inside viewport
  React.useEffect(() => {
    const { width, height } = wrappedRef.current.getBoundingClientRect();
    const { innerHeight, innerWidth } = window;

    const newDim = {};

    if (dim.translateX > innerWidth - TOLERANCE) {
      newDim.translateX = innerWidth - TOLERANCE;
    }
    if (dim.translateX + width < TOLERANCE) {
      newDim.translateX = TOLERANCE - width;
    }
    if (dim.translateY > innerHeight - TOLERANCE) {
      newDim.translateY = innerHeight - TOLERANCE;
    }
    if (dim.translateY + height < TOLERANCE) {
      newDim.translateY = TOLERANCE - height;
    }
    if (Object.keys(newDim).length > 0) {
      setDim((prevDim) => ({
        ...prevDim,
        ...newDim,
      }));
    }
  }, [dim.translateX, dim.translateY, setDim]);

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateBoardStateZoomingDelay = React.useCallback(
    debounce((newState) => {
      setBoardState(newState);
    }, 300),
    [setBoardState]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateBoardStatePanningDelay = React.useCallback(
    debounce((newState) => {
      setBoardState(newState);
    }, 200),
    [setBoardState]
  );

  // Update boardState on zoom or pan
  React.useEffect(() => {
    if (!prevDim) {
      return;
    }
    if (prevDim.scale !== dim.scale) {
      setBoardState((prev) =>
        !prev.zooming ? { ...prev, zooming: true } : prev
      );
      updateBoardStateZoomingDelay((prev) =>
        prev.zooming ? { ...prev, zooming: false } : prev
      );
    }
    if (
      prevDim.translateY !== dim.translateY ||
      prevDim.translateX !== dim.translateX
    ) {
      setBoardState((prev) =>
        !prev.panning ? { ...prev, panning: true } : prev
      );
      updateBoardStatePanningDelay((prev) =>
        prev.panning ? { ...prev, panning: false } : prev
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dim, updateBoardStatePanningDelay, updateBoardStateZoomingDelay]);

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

  /*const onWheel = React.useCallback(
    (e) => {
      const { deltaX, deltaY, clientX, clientY, ctrlKey, altKey } = e;

      // On a trackpad, the pinch gesture sets the ctrlKey to true.
      // In that situation, we want to use the custom scaling below, not the browser default zoom.
      // Hence in this situation we avoid to return immediately.
      if (altKey || (ctrlKey && !isMacOS())) {
        return;
      }

      // On a trackpad, the pinch and pan events are differentiated by the crtlKey value.
      // On a pinch gesture, the ctrlKey is set to true, so we want to have a scaling effect.
      // If we are only moving the fingers in the same direction, a pan is needed.
      // Ref: https://medium.com/@auchenberg/detecting-multi-touch-trackpad-gestures-in-javascript-a2505babb10e
      if (isMacOS() && !ctrlKey) {
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
            newScale = 8;
          }

          if (newScale < 0.1) {
            newScale = 0.1;
          }
          return {
            scale: newScale,
            x: clientX,
            y: clientY,
          };
        });
      }
    },
    [setDim]
  );*/

  /*const onMouseDown = (e) => {
    if (!e.isPrimary) {
      return;
    }

    const {
      target,
      altKey,
      ctrlKey,
      metaKey,
      button,
      clientX,
      clientY,
      pointerId,
    } = e;

    const outsideItem =
      !insideClass(target, "item") || insideClass(target, "locked");

    const metaKeyPressed = altKey || ctrlKey || metaKey;

    const goodButton = moveFirst
      ? button === 0 && !metaKeyPressed
      : button === 1 || (button === 0 && metaKeyPressed);

    if (goodButton && (outsideItem || !moveFirst)) {
      stateRef.current.moving = true;
      stateRef.current.startX = clientX;
      stateRef.current.startY = clientY;
      stateRef.current.startTranslateX = dim.translateX;
      stateRef.current.startTranslateY = dim.translateY;
      wrapperRef.current.style.cursor = "move";
      try {
        target.setPointerCapture(pointerId);
      } catch (e) {
        console.log("Fail to capture pointer", e);
      }
    }
  };*/

  /*const onMouseMove = (e) => {
    if (stateRef.current.moving) {
      if (!e.isPrimary) {
        return;
      }
      const { clientX, clientY } = e;

      const [deltaX, deltaY] = [
        clientX - stateRef.current.startX,
        clientY - stateRef.current.startY,
      ];
      setDim((prevDim) => {
        return {
          ...prevDim,
          translateX: stateRef.current.startTranslateX + deltaX,
          translateY: stateRef.current.startTranslateY + deltaY,
        };
      });
    }
  };*/

  /*const onMouseUp = React.useCallback((e) => {
    if (!e.isPrimary) {
      return;
    }
    stateRef.current.moving = false;
    wrapperRef.current.style.cursor = "auto";
  }, []);*/

  const onZoom = (e) => {
    //const { clientX, clientY, scale } = e;

    const {
      delta: [, deltaY],
      event: { clientX, clientY },
    } = e;

    const scale = 1 - deltaY / (isMacOS() ? 25 : 10);

    setScale((prevScale) => {
      let newScale = prevScale.scale * scale;
      if (newScale > 8) {
        newScale = 8;
      }

      if (newScale < 0.1) {
        newScale = 0.1;
      }
      return {
        scale: newScale,
        x: clientX,
        y: clientY,
      };
    });
  };

  React.useEffect(() => {
    document.addEventListener("gesturestart", (e) => e.preventDefault());
    document.addEventListener("gesturechange", (e) => e.preventDefault());
  }, []);

  const onPinch = React.useCallback((e) => {
    //const { clientX, clientY, scale } = e;
    //console.log("e", e);

    const {
      vdva: [vdx],
      origin: [clientX, clientY],
    } = e;

    setScale((prevScale) => {
      let newScale = prevScale.scale + vdx * prevScale.scale;
      if (newScale > 8) {
        newScale = 8;
      }

      if (newScale < 0.1) {
        newScale = 0.1;
      }
      return {
        scale: newScale,
        x: clientX,
        y: clientY,
      };
    });
  }, []);

  const onPan = (e) => {
    const {
      delta: [deltaX, deltaY],
      buttons,
      altKey,
      touches,
      event: { target },
    } = e;

    const outsideItem =
      !insideClass(target, "item") || insideClass(target, "locked");

    const metaKeyPressed = altKey;

    const goodButton = moveFirst
      ? buttons === 1 && !metaKeyPressed
      : buttons === 4 || (buttons === 1 && metaKeyPressed) || touches > 1;

    if (goodButton && (outsideItem || !moveFirst)) {
      setDim((prevDim) => {
        return {
          ...prevDim,
          translateX: prevDim.translateX + deltaX,
          translateY: prevDim.translateY + deltaY,
        };
      });
    }
  };

  useGesture(
    { onDrag: onPan, onWheel: onZoom, onPinch },
    { domTarget: wrapperRef }
  );

  return (
    <div ref={wrapperRef} style={{ touchAction: "none" }}>
      <Pane {...dim} ref={wrappedRef}>
        {children}
      </Pane>
    </div>
  );

  /*return (
    <Gesture onPan={onPan} onZoom={onZoom} onDrag={onDrag}>
      <Pane {...dim} ref={wrappedRef}>
        {children}
      </Pane>
    </Gesture>
  );*/
};

export default PanZoomRotate;
