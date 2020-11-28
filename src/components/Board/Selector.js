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

import Gesture from "./Gesture";

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

  /*const onMouseDown = useRecoilCallback(
    ({ snapshot }) => async (e) => {
      if (!e.isPrimary) {
        return;
      }
      const {
        target,
        pointerId,
        currentTarget,
        clientX,
        clientY,
        button,
        altKey,
        ctrlKey,
        metaKey,
      } = e;

      const outsideItem =
        !insideClass(target, "item") || insideClass(target, "locked");

      const metaKeyPressed = altKey || ctrlKey || metaKey;

      const goodButton = moveFirst
        ? button === 1 || (button === 0 && metaKeyPressed)
        : button === 0 && !metaKeyPressed;

      if (goodButton && (outsideItem || moveFirst)) {
        const { top, left } = currentTarget.getBoundingClientRect();

        const panZoomRotate = await snapshot.getPromise(PanZoomRotateAtom);
        const displayX = (clientX - left) / panZoomRotate.scale;
        const displayY = (clientY - top) / panZoomRotate.scale;

        stateRef.current.moving = true;
        stateRef.current.startX = displayX;
        stateRef.current.startY = displayY;

        setSelector({ ...stateRef.current });
        wrapperRef.current.style.cursor = "crosshair";

        try {
          currentTarget.setPointerCapture(pointerId);
        } catch (e) {
          console.log("Fail to capture pointer", e);
        }

        setBoardState((prev) => ({ ...prev, selecting: true }));
      }
    },
    [moveFirst, setBoardState]
  );*/

  /*const onMouseMove = useRecoilCallback(
    ({ snapshot }) => async (e) => {
      if (stateRef.current.moving) {
        if (!e.isPrimary) {
          return;
        }
        const { currentTarget, clientX, clientY } = e;

        const { top, left } = currentTarget.getBoundingClientRect();

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
  );*/

  /*const onMouseUp = useRecoilCallback(
    ({ snapshot }) => async (e) => {
      const { target } = e;
      if (stateRef.current.moving) {
        if (!e.isPrimary) {
          return;
        }

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
          (!insideClass(target, "item") || insideClass(target, "locked")) &&
          insideClass(target, "board")
        ) {
          setSelected(emptySelection);
        }
      }
    },
    [emptySelection, moveFirst, setBoardState, setSelected]
  );*/

  const onDragStart = ({ buttons, altKey, touches }) => {
    const outsideItem = true;
    //!insideClass(target, "item") || insideClass(target, "locked");

    const metaKeyPressed = altKey;

    const goodButton = moveFirst
      ? buttons === 4 || (buttons === 4 && metaKeyPressed)
      : buttons === 1 && !metaKeyPressed;

    if (goodButton && (outsideItem || moveFirst) && touches <= 1) {
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
      touches,
      event,
      tap,
      ...rest
    }) => {
      console.log("drag", touches, rest);
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

  /*const onTap = React.useCallback(
    (e) => {
      const { target } = e;
      if (
        (!insideClass(target, "item") || insideClass(target, "locked")) &&
        insideClass(target, "board")
      ) {
        setSelected(emptySelection);
      }
    },
    [emptySelection, setSelected]
  );*/

  useGesture({ onDrag, onDragStart, onDragEnd }, { domTarget: wrapperRef });

  return (
    <div ref={wrapperRef} style={{ touchAction: "none" }}>
      {selector.moving && <SelectorZone {...selector} />}
      {children}
    </div>
  );
};

export default Selector;
