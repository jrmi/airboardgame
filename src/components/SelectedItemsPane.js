import React from "react";
import styled from "styled-components";

import { useRecoilValue } from "recoil";
import { useItems } from "./Board/Items";
import { useItemActions } from "./Board/Items";
import { selectedItemsAtom } from "../components/Board/Selector";

import { insideClass } from "../utils";

import ItemFormFactory from "./Board/Items/Item/forms/ItemFormFactory";

import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

import { useTranslation } from "react-i18next";

const SelectedPane = styled.div.attrs(() => ({ className: "card" }))`
  position: absolute;
  right: 0.5em;
  bottom: 0.5em;
  background-color: #ffffffe0;
  padding: 0.5em;
  max-height: 66%;
  overflow-y: scroll;
`;

const CardContent = styled.div.attrs(() => ({ className: "content" }))`
  display: flex;
  flex-direction: column;
  padding: 0.5em;
`;

export const SelectedItems = ({ edit }) => {
  const { updateItem } = useItems();

  const {
    align,
    remove,
    revealForMe,
    toggleFlip,
    toggleLock,
    toggleTap,
    shuffle,
    selectedItemList,
    availableActions,
    rotate,
  } = useItemActions();

  const { t } = useTranslation();

  const selectedItems = useRecoilValue(selectedItemsAtom);

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
          onClick: remove,
        },
        {
          label: t("No"),
          onClick: () => {},
        },
      ],
    });
  };

  if (selectedItems.length === 1 && edit) {
    return (
      <SelectedPane>
        {selectedItemList.map((item) => (
          <div className="card" key={item.id}>
            <header>
              <h3>{t("Edit item")}</h3>
            </header>
            <CardContent>
              <ItemFormFactory item={item} onSubmitHandler={onSubmitHandler} />
              <button onClick={onRemove}>{t("Remove")}</button>
            </CardContent>
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
        <CardContent>
          {availableActions.includes("flip") && (
            <button onClick={toggleFlip}>
              {t("Reveal") + "/" + t("Hide")}
            </button>
          )}
          {availableActions.includes("tap") && (
            <button onClick={toggleTap}>{t("Tap") + "/" + t("Untap")}</button>
          )}
          {availableActions.includes("rotate90") && (
            <button
              onClick={() => {
                rotate(90);
              }}
            >
              {t("Rotate 90")}
            </button>
          )}
          {availableActions.includes("rotate60") && (
            <button
              onClick={() => {
                rotate(60);
              }}
            >
              {t("Rotate 60")}
            </button>
          )}
          {availableActions.includes("rotate45") && (
            <button
              onClick={() => {
                rotate(45);
              }}
            >
              {t("Rotate 45")}
            </button>
          )}
          {availableActions.includes("rotate30") && (
            <button
              onClick={() => {
                rotate(30);
              }}
            >
              {t("Rotate 30")}
            </button>
          )}
          {selectedItems.length > 1 && (
            <>
              <button onClick={align}>{t("Stack")}</button>
              <button onClick={shuffle}>{t("Shuffle")}</button>
            </>
          )}
          {availableActions.includes("lock") && (
            <button onClick={toggleLock}>
              {t("Unlock") + "/" + t("Lock")}
            </button>
          )}
          {edit && <button onClick={onRemove}>{t("Remove all")}</button>}
        </CardContent>
      </div>
    </SelectedPane>
  );
};

export default SelectedItems;
