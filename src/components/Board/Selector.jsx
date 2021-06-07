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
import { insideClass, isItemInsideElement } from "../../utils";
import throttle from "lodash.throttle";

import Gesture from "./Gesture";

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
  z-index: 210;
  position: absolute;
  background-color: hsla(0, 40%, 50%, 10%);
  border: 2px solid hsl(0, 55%, 40%);
`;

const findSelected = (itemMap) => {
  const selector = document.body.querySelector(".selector");
  if (!selector) {
    return [];
  }

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
      return isItemInsideElement(elem, selector);
    })
    .map((elem) => elem.id);
};

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
    ({ snapshot }) =>
      throttle(async () => {
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
      }, 300),
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

  const onDragStart = ({ button, altKey, ctrlKey, metaKey, target }) => {
    const outsideItem =
      !insideClass(target, "item") || insideClass(target, "locked");

    const metaKeyPressed = altKey || ctrlKey || metaKey;

    const goodButton = moveFirst
      ? button === 1 || (button === 0 && metaKeyPressed)
      : button === 0 && !metaKeyPressed;

    if (goodButton && (outsideItem || moveFirst)) {
      stateRef.current.moving = true;
      setBoardState((prev) => ({ ...prev, selecting: true }));
      wrapperRef.current.style.cursor = "crosshair";
    }
  };

  const onDrag = useRecoilCallback(
    ({ snapshot }) => async ({ distanceY, distanceX, startX, startY }) => {
      if (stateRef.current.moving) {
        const { top, left } = wrapperRef.current.getBoundingClientRect();

        const panZoomRotate = await snapshot.getPromise(PanZoomRotateAtom);

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
    []
  );

  const onDragEnd = () => {
    if (stateRef.current.moving) {
      setBoardState((prev) => ({ ...prev, selecting: false }));
      stateRef.current.moving = false;
      setSelector({ moving: false });
      wrapperRef.current.style.cursor = "auto";
    }
  };

  const onLongTap = React.useCallback(
    ({ target }) => {
      const foundElement = insideClass(target, "item");
      if (foundElement) {
        setSelected([foundElement.id]);
      }
    },
    [setSelected]
  );

  const onTap = useRecoilCallback(
    ({ snapshot }) => async ({ target, ctrlKey, metaKey }) => {
      const foundItem = insideClass(target, "item");
      if (
        (!foundItem || insideClass(foundItem, "locked")) &&
        insideClass(target, "board")
      ) {
        setSelected(emptySelection);
      } else {
        const selectedItems = await snapshot.getPromise(selectedItemsAtom);
        if (foundItem && !selectedItems.includes(foundItem.id)) {
          if (ctrlKey || metaKey) {
            setSelected((prev) => [...prev, foundItem.id]);
          } else {
            setSelected([foundItem.id]);
          }
        }
      }
    },
    [emptySelection, setSelected]
  );

  return (
    <Gesture
      onDragStart={onDragStart}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      onTap={onTap}
      onLongTap={onLongTap}
    >
      <div ref={wrapperRef}>
        {selector.moving && <SelectorZone {...selector} />}
        {children}
      </div>
    </Gesture>
  );
};

export default Selector;
