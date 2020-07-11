import React from "react";

import {
  atom,
  useRecoilValue,
  useRecoilState,
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
    top: `${top}px`,
    left: `${left}px`,
    height: `${height}px`,
    width: `${width}px`,
  },
}))`
  z-index: 100;
  position: absolute;
  background-color: #ff000050;
`;

const Selector = ({ children }) => {
  const panZoomRotate = useRecoilValue(PanZoomRotateAtom);

  const [selected, setSelected] = useRecoilState(selectedItemsAtom);
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

  const onMouseDown = (e) => {
    if (e.button === 0 && !e.altKey && !insideClass(e.target, "item")) {
      const { top, left } = e.currentTarget.getBoundingClientRect();
      const displayX = (e.clientX - left) / panZoomRotate.scale;
      const displayY = (e.clientY - top) / panZoomRotate.scale;

      stateRef.current.moving = true;
      stateRef.current.startX = displayX;
      stateRef.current.startY = displayY;

      setSelector({ ...stateRef.current });
      wrapperRef.current.style.cursor = "crosshair";
    }
  };

  const onMouseMouve = (e) => {
    if (stateRef.current.moving) {
      if (selected.length) setSelected([]);

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
      e.preventDefault();
    }
  };

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
      onMouseMove={onMouseMouve}
      onMouseEnter={onMouseUp}
      onMouseOut={onMouseMouve}
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
