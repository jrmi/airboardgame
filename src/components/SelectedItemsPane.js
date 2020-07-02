import React from "react";
import styled from "styled-components";

import { useRecoilValue } from "recoil";
import { useItems } from "./Board/Items";
import { selectedItemsAtom } from "../components/Board/Selector";

import { insideClass } from "../utils";

import ItemFormFactory from "./Board/Items/Item/forms/ItemFormFactory";

import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

import { useTranslation } from "react-i18next";
import { useUsers } from "./users";

const SelectedPane = styled.div.attrs(() => ({ className: "casrd" }))`
  position: absolute;
  right: 0.5em;
  bottom: 0.5em;
  background-color: #ffffffe0;
  padding: 0.5em;
  max-height: 66%;
  overflow-y: scroll;
`;

export const SelectedItems = ({ edit }) => {
  const {
    itemList,
    updateItem,
    batchUpdateItems,
    shuffleSelectedItems,
    removeItem,
    reverseItemsOrder,
  } = useItems();

  const { t } = useTranslation();

  const { currentUser } = useUsers();

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

  const toggleTap = React.useCallback(() => {
    const tappedCount = selectedItemList.filter(
      ({ rotation }) => rotation === 90
    ).length;

    let untap = false;
    if (tappedCount > selectedItems.length / 2) {
      untap = true;
    }

    batchUpdateItems(selectedItems, (item) => ({
      ...item,
      rotation: untap ? 0 : 90,
    }));
  }, [selectedItems, batchUpdateItems, selectedItemList]);

  const toggleLock = React.useCallback(() => {
    batchUpdateItems(selectedItems, (item) => ({
      ...item,
      locked: !item.locked,
    }));
  }, [selectedItems, batchUpdateItems]);

  const toggleFlip = React.useCallback(() => {
    const flippedCount = selectedItemList.filter(({ flipped }) => flipped)
      .length;

    let flip = true;
    if (flippedCount > selectedItems.length / 2) {
      flip = false;
    }
    batchUpdateItems(selectedItems, (item) => ({
      ...item,
      flipped: flip,
      unflippedFor: undefined,
    }));
    reverseItemsOrder(selectedItems);
  }, [selectedItemList, selectedItems, batchUpdateItems, reverseItemsOrder]);

  const revealForMe = React.useCallback(() => {
    batchUpdateItems(selectedItems, (item) => ({
      ...item,
      flipped: true,
      unflippedFor: currentUser.id,
    }));
  }, [batchUpdateItems, selectedItems, currentUser.id]);

  React.useEffect(() => {
    const onKeyUp = (e) => {
      if (e.key === "f") {
        if (insideClass(e.target, "item")) return;
        toggleFlip();
      }
      if (e.key === "t") {
        if (insideClass(e.target, "item")) return;
        toggleTap();
      }
      if (e.key === "o") {
        if (insideClass(e.target, "item")) return;
        revealForMe();
      }
    };
    document.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("keyup", onKeyUp);
    };
  }, [revealForMe, toggleFlip, toggleTap]);

  const onSubmitHandler = React.useCallback(
    (formValues) => {
      updateItem(formValues.id, (item) => ({
        ...item,
        ...formValues,
      }));
    },
    [updateItem]
  );

  if (selectedItemList.length === 0) {
    return null;
  }

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

  if (selectedItems.length === 1) {
    return (
      <SelectedPane>
        {edit &&
          selectedItemList.map((item) => (
            <div className="card" key={item.id}>
              <header>
                <h3>{t("Edit item")}</h3>
              </header>
              <section className="content">
                <ItemFormFactory
                  item={item}
                  onSubmitHandler={onSubmitHandler}
                />
                <button onClick={onRemove}>{t("Remove")}</button>
              </section>
            </div>
          ))}
        {!edit &&
          selectedItemList.map((item) => (
            <div className="card" key={item.id}>
              <header>
                <h3>{t("Actions")}</h3>
              </header>
              <section className="content">
                {item.type === "image" && item.backContent && (
                  <button onClick={toggleFlip}>
                    {item.flipped ? t("Reveal") : t("Hide")}
                  </button>
                )}
                <button onClick={toggleTap}>
                  {item.rotation === 90 ? t("Untap") : t("Tap")}
                </button>
                <button onClick={toggleLock}>
                  {item.locked ? t("Unlock") : t("Lock")}
                </button>
              </section>
            </div>
          ))}
      </SelectedPane>
    );
  }
  return (
    <SelectedPane>
      <div className="card">
        <header>
          <h3>{t("items selected", { count: selectedItems.length })}</h3>
        </header>
        <section className="content">
          <button onClick={toggleFlip}>{t("Reveal") + "/" + t("Hide")}</button>
          <button onClick={toggleTap}>{t("Tap") + "/" + t("Untap")}</button>
          <button onClick={align}>{t("Stack")}</button>
          <button onClick={shuffleSelectedItems}>{t("Shuffle")}</button>
          {edit && <button onClick={onRemove}>{t("Remove all")}</button>}
        </section>
      </div>
    </SelectedPane>
  );
};

export default SelectedItems;
