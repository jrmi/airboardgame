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
import { insideClass, isPointInsideRect } from "../../utils";
import throttle from "lodash.throttle";

import { useGesture } from "react-use-gesture";

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

  // Reset selected on unmount
  React.useEffect(() => {
    return () => {
      setSelected(emptySelection);
    };
  }, [setSelected, emptySelection]);

  const onDragStart = ({ buttons, altKey, touches }) => {
    const metaKeyPressed = altKey;

    const goodButton = moveFirst
      ? buttons === 4 || (buttons === 1 && metaKeyPressed)
      : buttons === 1 && !metaKeyPressed;

    // touches not working. See https://github.com/pmndrs/react-use-gesture/issues/233
    if (goodButton && touches <= 1) {
      stateRef.current.moving = true;
      setBoardState((prev) => ({ ...prev, selecting: true }));
      wrapperRef.current.style.cursor = "crosshair";
    }
  };

  const onDragEnd = React.useCallback(() => {
    if (stateRef.current.moving) {
      setBoardState((prev) => ({ ...prev, selecting: false }));
      stateRef.current.moving = false;
      setSelector({ moving: false });
      wrapperRef.current.style.cursor = "auto";
    }
  }, [setBoardState]);

  const onDrag = useRecoilCallback(
    ({ snapshot }) => async ({
      movement: [distanceX, distanceY],
      initial: [startX, startY],
      event,
      tap,
    }) => {
      const panZoomRotate = await snapshot.getPromise(PanZoomRotateAtom);

      if (tap) {
        const { target } = event;
        if (
          (!insideClass(target, "item") || insideClass(target, "locked")) &&
          insideClass(target, "board")
        ) {
          setSelected(emptySelection);
        }
        onDragEnd();
        return;
      }

      if (stateRef.current.moving) {
        const { top, left } = wrapperRef.current.getBoundingClientRect();

        const displayX = (startX - left) / panZoomRotate.scale;
        const displayY = (startY - top) / panZoomRotate.scale;

        const displayDistanceX = distanceX / panZoomRotate.scale;
        const displayDistanceY = distanceY / panZoomRotate.scale;

        if (displayDistanceX > 0) {
          stateRef.current.left = displayX;
          stateRef.current.width = displayDistanceX;
        } else {
          stateRef.current.left = displayX + displayDistanceX;
          stateRef.current.width = -displayDistanceX;
        }
        if (displayDistanceY > 0) {
          stateRef.current.top = displayY;
          stateRef.current.height = displayDistanceY;
        } else {
          stateRef.current.top = displayY + displayDistanceY;
          stateRef.current.height = -displayDistanceY;
        }
        setSelector({ ...stateRef.current, moving: true });
      }
    },
    [emptySelection, onDragEnd, setSelected]
  );

  useGesture({ onDrag, onDragStart, onDragEnd }, { domTarget: wrapperRef });

  return (
    <div ref={wrapperRef} style={{ touchAction: "none" }}>
      {selector.moving && <SelectorZone {...selector} />}
      {children}
    </div>
  );
};

export default Selector;
