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

import { useGesture, useDrag } from "react-use-gesture";

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
  /*React.useEffect(() => {
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
  }, [dim.translateX, dim.translateY, setDim]);*/

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

  React.useEffect(() => {
    // Prevent some undesirable effect on safari
    document.addEventListener("gesturestart", (e) => e.preventDefault());
    document.addEventListener("gesturechange", (e) => e.preventDefault());
  }, []);

  const onWheel = ({ delta: [, deltaY], event: { clientX, clientY } }) => {
    if (deltaY === 0) {
      return;
    }

    const scale = 1 - (deltaY > 0 ? 1 : -1) / (isMacOS() ? 25 : 5);

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

  const onPinch = ({ vdva: [vdx], origin: [clientX, clientY] }) => {
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
  };

  const onPan = ({
    delta: [deltaX, deltaY],
    offset: [offsetX, offsetY],
    movement: [moveX, moveY],
    buttons,
    altKey,
    touches,
    event: { target },
  }) => {
    const outsideItem =
      !insideClass(target, "item") || insideClass(target, "locked");

    const metaKeyPressed = altKey;

    console.log(moveX, moveY, offsetX, offsetY);
    const goodButton = moveFirst
      ? buttons === 1 && !metaKeyPressed
      : buttons === 4 || (buttons === 1 && metaKeyPressed) || touches > 1;

    if (goodButton && (outsideItem || !moveFirst)) {
      setDim((prevDim) => {
        return {
          ...prevDim,
          /*translateX: prevDim.translateX + deltaX,
          translateY: prevDim.translateY + deltaY,*/
          translateX: moveX,
          translateY: moveY,
        };
      });
    }
  };

  const { innerHeight, innerWidth } = window;
  const limit = config.size * 0.5 * dim.scale;

  useDrag(onPan, {
    domTarget: wrapperRef,
    bounds: {
      left: -limit,
      right: innerWidth - limit,
      top: -limit,
      bottom: innerHeight - limit,
    },
    rubberband: true,
    initial: [dim.translateX, dim.translateY],
  });

  useGesture(
    { onWheel, onPinch },
    {
      domTarget: wrapperRef,
    }
  );

  return (
    <div ref={wrapperRef} style={{ touchAction: "none" }}>
      <Pane {...dim} ref={wrappedRef}>
        {children}
      </Pane>
    </div>
  );
};

export default PanZoomRotate;
