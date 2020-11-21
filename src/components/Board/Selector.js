import React from "react";

import {
  atom,
  useRecoilValue,
  useSetRecoilState,
  useRecoilCallback,
} from "recoil";
import styled from "styled-components";

import {
  PanZoomRotateAtom,
  BoardConfigAtom,
  ItemMapAtom,
  BoardStateAtom,
} from "./";
import { insideClass, isPointInsideRect, getPointerState } from "../../utils";
import throttle from "lodash.throttle";

export const selectedItemsAtom = atom({
  key: "selectedItems",
  default: [],
});

const SelectorZone = styled.div.attrs(({ top, left, height, width }) => ({
  className: "selector",
  style: {
    transform: `translate(${left}px, ${top}px)`,
    height: `${height}px`,
    width: `${width}px`,
  },
}))`
  z-index: 100;
  position: absolute;
  background-color: hsla(0, 40%, 50%, 10%);
  border: 2px solid hsl(0, 55%, 40%);
`;

const findSelected = throttle((itemMap) => {
  const selector = document.body.querySelector(".selector");
  if (!selector) {
    return [];
  }
  const rect = selector.getBoundingClientRect();

  return Array.from(document.getElementsByClassName("item"))
    .filter((elem) => {
      const { id } = elem;
      const item = itemMap[id];
      if (!item) {
        // Avoid to find item that are not yet removed from DOM
        console.error(`Missing item ${id}`);
        return false;
      }
      if (item.locked) {
        return false;
      }
      const fourElem = Array.from(elem.querySelectorAll(".corner"));
      return fourElem.every((corner) => {
        const { top: y, left: x } = corner.getBoundingClientRect();
        return isPointInsideRect({ x, y }, rect);
      });
    })
    .map((elem) => elem.id);
}, 150);

const Selector = ({ children, moveFirst }) => {
  const setSelected = useSetRecoilState(selectedItemsAtom);
  const setBoardState = useSetRecoilState(BoardStateAtom);

  const [selector, setSelector] = React.useState({});
  const [emptySelection] = React.useState([]);

  const wrapperRef = React.useRef(null);
  const stateRef = React.useRef({
    moving: false,
  });

  const config = useRecoilValue(BoardConfigAtom);

  // Reset selection on game loading
  React.useEffect(() => {
    setSelected(emptySelection);
  }, [config, emptySelection, setSelected]);

  const onMouseDown = useRecoilCallback(
    ({ snapshot }) => async (e) => {
      const outsideItem =
        !insideClass(e.target, "item") || insideClass(e.target, "locked");

      const metaKeyPressed = e.altKey || e.ctrlKey || e.metaKey;

      const goodButton = moveFirst
        ? e.button === 1 || (e.button === 0 && metaKeyPressed)
        : (e.button === 0 || e.touches) && !metaKeyPressed;

      if (goodButton && (outsideItem || moveFirst)) {
        const { top, left } = e.currentTarget.getBoundingClientRect();

        const { clientX, clientY } = getPointerState(e);

        const panZoomRotate = await snapshot.getPromise(PanZoomRotateAtom);
        const displayX = (clientX - left) / panZoomRotate.scale;
        const displayY = (clientY - top) / panZoomRotate.scale;

        stateRef.current.moving = true;
        stateRef.current.startX = displayX;
        stateRef.current.startY = displayY;

        setSelector({ ...stateRef.current });
        wrapperRef.current.style.cursor = "crosshair";

        setBoardState((prev) => ({ ...prev, selecting: true }));
      }
    },
    [moveFirst, setBoardState]
  );

  const throttledSetSelected = useRecoilCallback(
    ({ snapshot }) => async () => {
      if (stateRef.current.moving) {
        const itemMap = await snapshot.getPromise(ItemMapAtom);
        const selected = findSelected(itemMap);

        setSelected((prevSelected) => {
          if (JSON.stringify(prevSelected) !== JSON.stringify(selected)) {
            return selected;
          }
          return prevSelected;
        });
      }
    },
    [setSelected]
  );

  React.useEffect(() => {
    throttledSetSelected();
  }, [selector, throttledSetSelected]);

  const onMouseMove = useRecoilCallback(
    ({ snapshot }) => async (e) => {
      if (stateRef.current.moving) {
        const { top, left } = e.currentTarget.getBoundingClientRect();

        const { clientX, clientY } = getPointerState(e);

        const panZoomRotate = await snapshot.getPromise(PanZoomRotateAtom);

        const currentX = (clientX - left) / panZoomRotate.scale;
        const currentY = (clientY - top) / panZoomRotate.scale;

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
    },
    []
  );

  const onMouseUp = useRecoilCallback(
    ({ snapshot }) => async (e) => {
      if (stateRef.current.moving) {
        const itemMap = await snapshot.getPromise(ItemMapAtom);

        const selected = findSelected(itemMap, stateRef.current);

        if (selected.length === 0) {
          setSelected(emptySelection);
        } else {
          setSelected(selected);
        }

        stateRef.current = { moving: false };
        setSelector({ ...stateRef.current });
        wrapperRef.current.style.cursor = "auto";

        setBoardState((prev) => ({ ...prev, selecting: false }));
      } else {
        if (
          moveFirst &&
          (!insideClass(e.target, "item") || insideClass(e.target, "locked")) &&
          insideClass(e.target, "board")
        ) {
          setSelected(emptySelection);
        }
      }
    },
    [emptySelection, moveFirst, setBoardState, setSelected]
  );

  React.useEffect(() => {
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchend", onMouseUp);
    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchend", onMouseUp);
    };
  }, [onMouseUp]);

  // Reset selected on unmount
  React.useEffect(() => {
    return () => {
      setSelected(emptySelection);
    };
  }, [setSelected, emptySelection]);

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onTouchStart={onMouseDown}
      onTouchMove={onMouseMove}
      onMouseEnter={onMouseMove}
      onMouseOut={onMouseMove}
      ref={wrapperRef}
    >
      {selector.moving && (
        <SelectorZone
          {...selector}
          onMouseEnter={(e) => e.stopPropagation()}
          onMouseOut={(e) => e.stopPropagation()}
        />
      )}
      {children}
    </div>
  );
};

export default Selector;
