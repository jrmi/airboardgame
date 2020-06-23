import React from "react";
import styled from "styled-components";

import { useRecoilValue } from "recoil";
import { useItems } from "./Board/Items";
import { selectedItemsAtom } from "../components/Board/Selector";

import ItemFormFactory from "./Board/Items/Item/forms/ItemFormFactory";

import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { useTranslation } from "react-i18next";

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
    removeItem,
  } = useItems();

  const { t } = useTranslation();

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

  const onRemove = () => {
    confirmAlert({
      title: t("Confirmation"),
      message: t("Do you really want to remove selected items ?"),
      buttons: [
        {
          label: t("Yes"),
          onClick: () =>
            selectedItems.forEach((id) => {
              removeItem(id);
            }),
        },
        {
          label: t("No"),
          onClick: () => {},
        },
      ],
    });
  };

  return (
    <SelectedPane>
      {selectedItems.length > 1 && (
        <div>
          <h2>{selectedItems.length} items selected</h2>
          <button onClick={shuffleSelectedItems}>{t("Shuffle")}</button>
          <button onClick={align}>{t("Stack")}</button>
          <button onClick={flip}>{t("Hide")}</button>
          <button onClick={unflip}>{t("SHow")}</button>
          <button onClick={onRemove}>{t("Remove all")}</button>
        </div>
      )}
      {selectedItems.length === 1 &&
        selectedItemList.map((item) => (
          <div key={item.id}>
            <h2>{t("Edit item")}</h2>
            <ItemFormFactory item={item} onSubmitHandler={onSubmitHandler} />
            <button onClick={onRemove}>{t("Remove")}</button>
          </div>
        ))}
    </SelectedPane>
  );
};

export default SelectedItems;
