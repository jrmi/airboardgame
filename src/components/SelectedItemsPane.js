import React from "react";
import styled from "styled-components";

import { useRecoilValue, useRecoilCallback } from "recoil";
import { useItems } from "./Board/Items";
import { useItemActions } from "./boardComponents/useItemActions";
import {
  selectedItemsAtom,
  PanZoomRotateAtom,
  ItemMapAtom,
} from "../components/Board/";

import debounce from "lodash.debounce";

import { insideClass } from "../utils";

import ItemFormFactory from "./boardComponents/ItemFormFactory";

// import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

import { useTranslation } from "react-i18next";

const SelectedPane = styled.div`
  position: absolute;
  left: 0.5em;
  bottom: 0.5em;
  top: 4.5em;
  background-color: transparent;
  overflow-y: scroll;
  transform: scaleX(-1);
  & > div {
    transform: scaleX(-1);
  }
`;

const ActionPane = styled.div.attrs(({ top, left }) => ({
  style: {
    top: `${top - 85}px`,
    left: `${left}px`,
  },
}))`
  position: absolute;
  display: flex;
  background-color: var(--bg-color);
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  padding: 0.5em;
  
  box-shadow: 2.5px 4.33px 14.7px 0.3px rgba(0, 0, 0, 0.7);

  & button{
    margin 0 4px;
    padding: 0em;
    height: 50px
  }
  & .button.icon-only{
    padding: 0em;
    opacity: 0.5;
  }
  & button.icon-only:hover{
    opacity: 1;
  }
  & .count{
    color: var(--color-secondary);
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 0.8em;
  }
  & .number{
    font-size: 1.5em;
    line-height: 1em;
  }
`;

const CardContent = styled.div.attrs(() => ({ className: "content" }))`
  display: flex;
  flex-direction: column;
  padding: 0.5em;
  background-color: var(--bg-secondary-color);
`;

const BoundingBoxZone = styled.div.attrs(({ top, left, height, width }) => ({
  style: {
    transform: `translate(${left}px, ${top}px)`,
    height: `${height}px`,
    width: `${width}px`,
  },
}))`
  top: 0;
  left: 0;
  z-index: 6;
  position: fixed;
  background-color: hsla(0, 40%, 50%, 0%);
  border: 1px dashed hsl(20, 55%, 40%);
  pointer-events: none;
`;

export const SelectedItems = () => {
  const { updateItem } = useItems();

  const { availableActions, actionMap } = useItemActions();
  const [showAction, setShowAction] = React.useState(false);
  const [showEdit, setShowEdit] = React.useState(false);

  const { t } = useTranslation();

  const selectedItems = useRecoilValue(selectedItemsAtom);
  const itemMap = useRecoilValue(ItemMapAtom);
  const panZoomRotate = useRecoilValue(PanZoomRotateAtom);
  const [boundingBoxLast, setBoundingBoxLast] = React.useState(null);

  // Show/Hide action after delay to avoid flip/flop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const showActionDelay = React.useCallback(
    debounce((show) => {
      setShowAction(show);
    }, 300),
    []
  );

  // Update bounding box
  const updateBox = useRecoilCallback(
    ({ snapshot }) => async () => {
      const selectedItems = await snapshot.getPromise(selectedItemsAtom);
      let boundingBox = null;

      selectedItems.forEach((itemId) => {
        const elem = document.getElementById(itemId);

        if (!elem) return;

        const {
          right: x2,
          bottom: y2,
          top: y,
          left: x,
        } = elem.getBoundingClientRect();

        if (!boundingBox) {
          boundingBox = {};
          boundingBox.x = x;
          boundingBox.y = y;
          boundingBox.x2 = x2;
          boundingBox.y2 = y2;
        } else {
          if (x < boundingBox.x) {
            boundingBox.x = x;
          }
          if (y < boundingBox.y) {
            boundingBox.y = y;
          }
          if (x2 > boundingBox.x2) {
            boundingBox.x2 = x2;
          }
          if (y2 > boundingBox.y2) {
            boundingBox.y2 = y2;
          }
        }
      });

      setBoundingBoxLast(
        boundingBox
          ? {
              top: boundingBox.y,
              left: boundingBox.x,
              height: boundingBox.y2 - boundingBox.y,
              width: boundingBox.x2 - boundingBox.x,
            }
          : null
      );
    },
    []
  );

  // Debounced version of update box
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateBoxDelay = React.useCallback(
    debounce(() => {
      updateBox();
    }, 300),
    [updateBox]
  );

  React.useEffect(() => {
    // Update selected elements bounding box
    if (selectedItems) {
      updateBox();
      updateBoxDelay(); // Delay to update after board item animation like tap/untap.
    }
  }, [selectedItems, itemMap, panZoomRotate, updateBox, updateBoxDelay]);

  React.useEffect(() => {
    // Show on selection
    if (selectedItems.length) {
      showActionDelay(true);
    } else {
      setShowAction(false);
    }
    setShowEdit(false);
  }, [selectedItems, showActionDelay]);

  React.useEffect(() => {
    // Hide when moving something
    if (selectedItems) {
      setShowAction(false);
      showActionDelay(true);
    }
  }, [selectedItems, itemMap, panZoomRotate, showActionDelay]);

  React.useEffect(() => {
    const onKeyUp = (e) => {
      // Block shortcut if we are typing in a textarea or input
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
      Object.values(actionMap).forEach(
        ({ shortcut, action, edit: whileEdit }) => {
          if (e.key === shortcut && showEdit === !!whileEdit) {
            action();
          }
        }
      );
    };
    document.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("keyup", onKeyUp);
    };
  }, [actionMap, showEdit]);

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

  const showEditPane = selectedItems.length === 1 && showEdit;

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
      {showAction && (
        <ActionPane {...boundingBoxLast}>
          {selectedItems.length > 1 && (
            <div className="count">
              <span className="number">{selectedItems.length}</span>
              <span>{t("Items")}</span>
            </div>
          )}
          {availableActions.map((action) => {
            const {
              label,
              action: handler,
              multiple,
              edit: onlyEdit,
              icon,
            } = actionMap[action];
            if (multiple && selectedItems.length < 2) return null;
            if (onlyEdit && !showEdit) return null;
            return (
              <button
                className="button clear icon-only"
                key={action}
                onClick={handler}
                title={label}
              >
                <img
                  src={icon}
                  style={{ width: "32px", height: "32px" }}
                  alt={label}
                />
              </button>
            );
          })}

          <button
            className="button clear icon-only"
            onClick={() => setShowEdit((prev) => !prev)}
            title={t("Edit")}
          >
            <img
              src="https://icongr.am/feather/edit.svg?size=32&color=ffffff"
              alt={t("Edit")}
            />
          </button>
        </ActionPane>
      )}
      {boundingBoxLast && selectedItems.length > 1 && (
        <BoundingBoxZone {...boundingBoxLast} />
      )}
    </>
  );
};

export default SelectedItems;
