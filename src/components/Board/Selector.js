import React from "react";

import {
  atom,
  useRecoilValue,
  useSetRecoilState,
  useRecoilCallback,
} from "recoil";
import styled from "styled-components";

import { PanZoomRotateAtom, ItemListAtom, BoardConfigAtom } from "./";
import { insideClass, isPointInsideRect } from "../../utils";

export const selectedItemsAtom = atom({
  key: "selectedItems",
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

const SelectorZone = styled.div.attrs(({ top, left, height, width }) => ({
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

const Selector = ({ children }) => {
  const setSelected = useSetRecoilState(selectedItemsAtom);
  const [selector, setSelector] = React.useState({});

  const wrapperRef = React.useRef(null);
  const stateRef = React.useRef({
    moving: false,
  });

  const config = useRecoilValue(BoardConfigAtom);

  // Reset selection on game loading
  React.useEffect(() => {
    setSelected([]);
  }, [config, setSelected]);

  const onMouseDown = useRecoilCallback(async (snapshot, e) => {
    if (
      e.button === 0 &&
      !e.altKey &&
      (!insideClass(e.target, "item") || insideClass(e.target, "locked"))
    ) {
      const { top, left } = e.currentTarget.getBoundingClientRect();
      const { clientX, clientY } = e;

      const panZoomRotate = await snapshot.getPromise(PanZoomRotateAtom);
      const displayX = (clientX - left) / panZoomRotate.scale;
      const displayY = (clientY - top) / panZoomRotate.scale;

      stateRef.current.moving = true;
      stateRef.current.startX = displayX;
      stateRef.current.startY = displayY;

      setSelector({ ...stateRef.current });
      wrapperRef.current.style.cursor = "crosshair";
    }
  }, []);

  const throttledSetSelected = useRecoilCallback(
    async (snapshot, selector) => {
      if (stateRef.current.moving) {
        const itemList = await snapshot.getPromise(ItemListAtom);

        const selected = findSelected(itemList, selector).map(({ id }) => id);
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

  // Reset selection on game loading
  React.useEffect(() => {
    throttledSetSelected(selector);
  }, [selector, throttledSetSelected]);

  const onMouseMove = useRecoilCallback(async (snapshot, e) => {
    if (stateRef.current.moving) {
      const { top, left } = e.currentTarget.getBoundingClientRect();
      const { clientX, clientY } = e;
      e.preventDefault();

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
  }, []);

  const onMouseUp = useRecoilCallback(
    async (snapshot) => {
      if (stateRef.current.moving) {
        const itemList = await snapshot.getPromise(ItemListAtom);
        const selected = findSelected(itemList, stateRef.current).map(
          ({ id }) => id
        );
        setSelected(selected);
        stateRef.current = { moving: false };
        setSelector({ ...stateRef.current });
        wrapperRef.current.style.cursor = "auto";
      }
    },
    [setSelected]
  );

  React.useEffect(() => {
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseUp]);

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseMove}
      onMouseOut={onMouseMove}
      ref={wrapperRef}
    >
      {selector.moving && (
        <SelectorZone
          top={selector.top}
          left={selector.left}
          height={selector.height}
          width={selector.width}
          onMouseEnter={(e) => e.stopPropagation()}
          onMouseOut={(e) => e.stopPropagation()}
        />
      )}
      {children}
    </div>
  );
};

export default Selector;
