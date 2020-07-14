import React from "react";
import styled from "styled-components";

import { useRecoilValue } from "recoil";
import { useItems } from "./Board/Items";
import { useItemActions } from "./Board/Items";
import { selectedItemsAtom } from "../components/Board/";

import { insideClass } from "../utils";

import ItemFormFactory from "./Board/Items/Item/ItemFormFactory";

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
    toggleFlip,
    toggleFlipSelf,
    toggleLock,
    toggleTap,
    shuffle,
    availableActions,
    rotate,
  } = useItemActions();

  const { t } = useTranslation();

  const selectedItems = useRecoilValue(selectedItemsAtom);

  const actionMap = React.useMemo(
    () => ({
      flip: {
        action: toggleFlip,
        label: t("Reveal") + "/" + t("Hide"),
        shortcut: "f",
      },
      flipSelf: {
        action: toggleFlipSelf,
        label: t("Reveal for me"),
        shortcut: "o",
      },
      tap: {
        action: toggleTap,
        label: t("Tap") + "/" + t("Untap"),
        shortcut: "t",
      },
      rotate90: {
        action: rotate.bind(null, 90),
        label: t("Rotate 90"),
      },
      rotate60: {
        action: rotate.bind(null, 60),
        label: t("Rotate 60"),
      },
      rotate45: {
        action: rotate.bind(null, 45),
        label: t("Rotate 45"),
      },
      rotate30: {
        action: rotate.bind(null, 30),
        label: t("Rotate 30"),
      },
      stack: {
        action: align,
        label: t("Stack"),
        shortcut: "",
        multiple: true,
      },
      shuffle: {
        action: shuffle,
        label: t("Shuffle"),
        shortcut: "",
        multiple: true,
      },
      lock: {
        action: toggleLock,
        label: t("Unlock") + "/" + t("Lock"),
      },
      remove: {
        action: remove,
        label: t("Remove all"),
        shortcut: "r",
        edit: true,
      },
    }),
    [
      align,
      remove,
      toggleFlipSelf,
      rotate,
      shuffle,
      t,
      toggleFlip,
      toggleLock,
      toggleTap,
    ]
  );

  React.useEffect(() => {
    const onKeyUp = (e) => {
      // Block shortcut if we are typing in a textarea or input
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
      Object.values(actionMap).forEach(({ shortcut, action }) => {
        if (e.key === shortcut) {
          action();
        }
      });
    };
    document.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("keyup", onKeyUp);
    };
  }, [actionMap]);

  const onSubmitHandler = React.useCallback(
    (formValues) => {
      updateItem(formValues.id, (item) => ({
        ...item,
        ...formValues,
      }));
    },
    [updateItem]
  );

  const onDblClick = React.useCallback(
    (e) => {
      const foundElement = insideClass(e.target, "item");
      // We dblclick oustside of an element
      if (!foundElement) return;

      if (e.ctrlKey && availableActions.length > 1) {
        // Use second action
        actionMap[availableActions[1]].action();
      } else {
        actionMap[availableActions[0]].action();
      }
    },
    [actionMap, availableActions]
  );

  React.useEffect(() => {
    document.addEventListener("dblclick", onDblClick);
    return () => {
      document.removeEventListener("dblclick", onDblClick);
    };
  }, [onDblClick]);

  if (selectedItems.length === 0) {
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
        {selectedItems.map((itemId) => (
          <div className="card" key={itemId}>
            <header>
              <h3>{t("Edit item")}</h3>
            </header>
            <CardContent>
              <ItemFormFactory
                itemId={itemId}
                onSubmitHandler={onSubmitHandler}
              />
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
          {availableActions.map((action) => {
            const {
              label,
              action: handler,
              multiple,
              edit: onlyEdit,
            } = actionMap[action];
            if (multiple && selectedItems.length < 2) return null;
            if (onlyEdit && !edit) return null;
            return (
              <button key={action} onClick={handler}>
                {label}
              </button>
            );
          })}
        </CardContent>
      </div>
    </SelectedPane>
  );
};

export default SelectedItems;
