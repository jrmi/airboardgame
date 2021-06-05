import React from "react";

import {
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
  useRecoilCallback,
} from "recoil";
import {
  BoardConfigAtom,
  BoardStateAtom,
  PanZoomRotateAtom,
  selectedItemsAtom,
} from "./";
import { insideClass } from "../../utils/";

import usePrevious from "../../hooks/usePrevious";

import styled from "styled-components";

import debounce from "lodash.debounce";

import Gesture from "./Gesture";
import usePositionNavigator from "./usePositionNavigator";

const TOLERANCE = 100;

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
  const [scaleBoundaries, setScaleBoundaries] = React.useState([0.1, 8]);
  const [dim, setDim] = useRecoilState(PanZoomRotateAtom);
  const config = useRecoilValue(BoardConfigAtom);
  const setBoardState = useSetRecoilState(BoardStateAtom);
  const prevDim = usePrevious(dim);

  usePositionNavigator();

  const [scale, setScale] = React.useState({
    scale: 1,
    x: 0,
    y: 0,
  });

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

    const minSize = Math.min(innerHeight, innerWidth);

    const newScale = (minSize / config.size) * 0.8;

    setScaleBoundaries([newScale * 0.8, Math.max(newScale * 30, 8)]);

    setDim((prev) => ({
      ...prev,
      scale: newScale,
      translateX: innerWidth / 2 - (config.size / 2) * newScale,
      translateY: innerHeight / 2 - (config.size / 2) * newScale,
    }));

    setScale((prev) => {
      return { ...prev, scale: newScale, x: 0, y: 0 };
    });
    // We only want to do it at component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.size]);

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

  const onZoom = React.useCallback(
    ({ clientX, clientY, scale }) => {
      setScale((prevScale) => {
        let newScale = prevScale.scale * (1 - scale / 200);
        if (newScale > scaleBoundaries[1]) {
          newScale = scaleBoundaries[1];
        }

        if (newScale < scaleBoundaries[0]) {
          newScale = scaleBoundaries[0];
        }

        return {
          scale: newScale,
          x: clientX,
          y: clientY,
        };
      });
    },
    [scaleBoundaries]
  );

  const onPan = React.useCallback(
    ({ deltaX, deltaY }) => {
      setDim((prevDim) => {
        return {
          ...prevDim,
          translateX: prevDim.translateX + deltaX,
          translateY: prevDim.translateY + deltaY,
        };
      });
    },
    [setDim]
  );

  const onDrag = React.useCallback(
    (state) => {
      const { target } = state;

      const outsideItem =
        !insideClass(target, "item") || insideClass(target, "locked");

      if (moveFirst && outsideItem) {
        onPan(state);
      }
    },
    [moveFirst, onPan]
  );

  const onKeyDown = useRecoilCallback(
    ({ snapshot }) => async (e) => {
      // Block shortcut if we are typing in a textarea or input
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;

      const selectedItems = await snapshot.getPromise(selectedItemsAtom);

      if (selectedItems.length) {
        return;
      }
      let moveX = 0;
      let moveY = 0;
      let zoom = 1;
      switch (e.key) {
        case "ArrowLeft":
          moveX = 10;
          break;
        case "ArrowRight":
          moveX = -10;
          break;
        case "ArrowUp":
          moveY = 10;
          break;
        case "ArrowDown":
          moveY = -10;
          break;
        case "PageUp":
          zoom = 1.2;
          break;
        case "PageDown":
          zoom = 0.8;
          break;
      }
      if (moveX || moveY || zoom !== 1) {
        if (e.shiftKey) {
          moveX = moveX * 5;
          moveY = moveY * 5;
        }
        if (e.ctrlKey || e.altKey || e.metaKey) {
          moveX = moveX / 5;
          moveY = moveY / 5;
        }
        setDim((prev) => ({
          ...prev,
          translateY: prev.translateY + moveY,
          translateX: prev.translateX + moveX,
        }));

        const { innerHeight, innerWidth } = window;

        const zoomX = innerWidth / 2;
        const zoomY = innerHeight / 2;

        setScale((prevScale) => {
          let newScale = prevScale.scale * zoom;
          if (newScale > scaleBoundaries[1]) {
            newScale = scaleBoundaries[1];
          }

          if (newScale < scaleBoundaries[0]) {
            newScale = scaleBoundaries[0];
          }

          return {
            scale: newScale,
            x: zoomX,
            y: zoomY,
          };
        });

        e.preventDefault();
      }
    },
    [scaleBoundaries, setDim]
  );

  React.useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);

  return (
    <Gesture onPan={onPan} onZoom={onZoom} onDrag={onDrag}>
      <Pane
        {...dim}
        ref={wrappedRef}
        onContextMenu={(e) => {
          e.preventDefault();
        }}
      >
        {children}
      </Pane>
    </Gesture>
  );
};

export default PanZoomRotate;
