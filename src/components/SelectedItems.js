import React from "react";
import styled from "styled-components";

import { useRecoilValue } from "recoil";
import useItemList from "../hooks/useItemList";
import { selectedItemsAtom } from "../components/Selector";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import ItemFormFactory from "./Item/forms/ItemFormFactory";

const SelectedPane = styled.div`
  position: fixed;
  right: 1em;
  bottom: 1em;
  background: #ffffff77;
  padding: 0.2em;
  max-height: 50vh;
  overflow-y: scroll;
`;

export const SelectedItems = () => {
  const {
    itemList,
    updateItem,
    batchUpdateItems,
    shuffleSelectedItems,
  } = useItemList();

  const selectedItems = useRecoilValue(selectedItemsAtom);

  const selectedItemList = React.useMemo(() => {
    return itemList.filter(({ id }) => selectedItems.includes(id));
  }, [itemList, selectedItems]);

  // Align selection to center
  const align = React.useCallback(() => {
    // Compute
    const minMax = { min: {}, max: {} };
    minMax.min.x = Math.min(...selectedItemList.map(({ x }) => x));
    minMax.min.y = Math.min(...selectedItemList.map(({ y }) => y));
    minMax.max.x = Math.max(
      ...selectedItemList.map(({ x, actualWidth }) => x + actualWidth)
    );
    minMax.max.y = Math.max(
      ...selectedItemList.map(({ y, actualHeight }) => y + actualHeight)
    );

    const [newX, newY] = [
      (minMax.min.x + minMax.max.x) / 2,
      (minMax.min.y + minMax.max.y) / 2,
    ];
    let index = -1;
    batchUpdateItems(selectedItems, (item) => {
      index += 1;
      return {
        ...item,
        x: newX - item.actualWidth / 2 + index,
        y: newY - item.actualHeight / 2 - index,
      };
    });
  }, [selectedItemList, selectedItems, batchUpdateItems]);

  const flip = React.useCallback(() => {
    batchUpdateItems(selectedItems, (item) => ({
      ...item,
      flipped: true,
    }));
  }, [selectedItems, batchUpdateItems]);

  const unflip = React.useCallback(() => {
    batchUpdateItems(selectedItems, (item) => ({
      ...item,
      flipped: false,
    }));
  }, [selectedItems, batchUpdateItems]);

  if (selectedItemList.length === 0) {
    return null;
  }

  const onSubmitHandler = (formValues) => {
    updateItem(formValues.id, (item) => ({
      ...item,
      ...formValues,
    }));
  };

  return (
    <SelectedPane>
      {selectedItems.length > 1 && (
        <div>
          <h2>{selectedItems.length} items selected</h2>
          <button onClick={shuffleSelectedItems}>Shuffle</button>
          <button onClick={align}>Stack</button>
          <button onClick={flip}>Flip</button>
          <button onClick={unflip}>UnFlip</button>
        </div>
      )}
      {selectedItems.length === 1 && (
        <ul
          style={{
            listStyle: "none",
          }}
        >
          {selectedItemList.length === 1 && (
            <ItemFormFactory
              item={selectedItemList[0]}
              onSubmitHandler={onSubmitHandler}
            />
          )}
          {selectedItemList.map(({ id, ...state }, index) => (
            <li
              key={id}
              style={{
                display: "flex",
                flexDirection: "column",
                width: "25em",
              }}
            >
              <h2 style={{ lineHeight: "30px" }}>{index}</h2>
              <label>
                Locked:
                <input
                  type="checkbox"
                  checked={Boolean(state.locked)}
                  onChange={() =>
                    updateItem(id, (item) => ({
                      ...item,
                      locked: !item.locked,
                    }))
                  }
                />
              </label>
              <label>
                Rotation:
                <Slider
                  defaultValue={0}
                  value={state.rotation}
                  min={-180}
                  max={180}
                  step={5}
                  included={false}
                  marks={{
                    "-45": -45,
                    "-30": -30,
                    0: 0,
                    30: 30,
                    45: 45,
                    90: 90,
                  }}
                  onChange={(value) =>
                    updateItem(id, (item) => ({
                      ...item,
                      rotation: parseInt(value, 10),
                    }))
                  }
                />
              </label>
            </li>
          ))}
        </ul>
      )}
    </SelectedPane>
  );
};

export default SelectedItems;
