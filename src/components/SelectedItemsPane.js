import React from "react";
import styled from "styled-components";

import { useRecoilValue } from "recoil";
import { useItems } from "./Board/Items";
import { useItemActions } from "./boardComponents/useItemActions";
import { selectedItemsAtom } from "../components/Board/";

import { insideClass } from "../utils";

import ItemFormFactory from "./boardComponents/ItemFormFactory";

// import { confirmAlert } from "react-confirm-alert";
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

const ActionPane = styled.div`
  position: fixed;
  left: 0em;
  top: 5px;
  display: flex;
  background-color: transparent;
  justify-content: center;
  width: 50%;
  z-index: 10001;
  margin: 0 25%;
  & button{
    margin 0 6px;
    padding: 0.4em;
    height: 40px
  }
`;

const CardContent = styled.div.attrs(() => ({ className: "content" }))`
  display: flex;
  flex-direction: column;
  padding: 0.5em;
`;

export const SelectedItems = ({ edit }) => {
  const { updateItem } = useItems();

  const { availableActions, actionMap } = useItemActions();

  const { t } = useTranslation();

  const selectedItems = useRecoilValue(selectedItemsAtom);

  React.useEffect(() => {
    const onKeyUp = (e) => {
      // Block shortcut if we are typing in a textarea or input
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
      Object.values(actionMap).forEach(
        ({ shortcut, action, edit: whileEdit }) => {
          if (e.key === shortcut && edit === !!whileEdit) {
            action();
          }
        }
      );
    };
    document.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("keyup", onKeyUp);
    };
  }, [actionMap, edit]);

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

      const filteredActions = availableActions.filter(
        (action) => !actionMap[action].disableDblclick
      );

      if (e.ctrlKey && filteredActions.length > 1) {
        // Use second action
        actionMap[filteredActions[1]].action();
      } else {
        if (filteredActions.length > 0) {
          actionMap[filteredActions[0]].action();
        }
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

  // Keep this code for later
  /*const onRemove = () => {
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
  };*/

  const showEditPane = selectedItems.length === 1 && edit;

  return (
    <>
      {showEditPane && (
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
              </CardContent>
            </div>
          ))}
        </SelectedPane>
      )}
      <ActionPane>
        <h3>#{selectedItems.length}</h3>
        {availableActions.map((action) => {
          const {
            label,
            action: handler,
            multiple,
            edit: onlyEdit,
            icon,
          } = actionMap[action];
          if (multiple && selectedItems.length < 2) return null;
          if (onlyEdit && !edit) return null;
          return (
            <button key={action} onClick={handler} title={label}>
              <img
                src={icon}
                style={{ width: "25px", height: "24px" }}
                alt={label}
              />
            </button>
          );
        })}
      </ActionPane>
    </>
  );
};

export default SelectedItems;
