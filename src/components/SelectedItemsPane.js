import React from "react";
import styled from "styled-components";

import { useRecoilValue } from "recoil";
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

const SelectedPane = styled.div.attrs(() => ({ className: "card" }))`
  position: absolute;
  right: 0.5em;
  bottom: 0.5em;
  background-color: #ffffffe0;
  padding: 0.5em;
  max-height: 66%;
  overflow-y: scroll;
`;

const ActionPane = styled.div.attrs(({ top, left }) => ({
  style: {
    top: `${top - 50}px`,
    left: `${left}px`,
  },
}))`
  position: absolute;
  display: flex;
  background-color: transparent;
  justify-content: center;
  //z-index: 1;
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

export const SelectedItems = ({ edit }) => {
  const { updateItem } = useItems();

  const { availableActions, actionMap } = useItemActions();
  const [showAction, setShowAction] = React.useState(false);

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
    }, 400),
    [setShowAction]
  );

  // Update bounding box
  const updateBox = React.useCallback(() => {
    let boundingBox = null;

    selectedItems.forEach((itemId) => {
      const elem = document.getElementById(itemId);

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
  }, [selectedItems]);

  // Debounced version of update box
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateBoxDelay = React.useCallback(
    debounce(() => {
      updateBox();
    }, 300),
    [updateBox]
  );

  React.useEffect(() => {
    // Update selected elemnts bounding box
    updateBox();
    updateBoxDelay(); // Delay to update after animation like tap.
  }, [selectedItems, itemMap, panZoomRotate, updateBox, updateBoxDelay]);

  React.useEffect(() => {
    // Show on selection
    showActionDelay(true);
  }, [selectedItems, showActionDelay]);

  React.useEffect(() => {
    // Hide when moving something
    setShowAction(false);
    showActionDelay(true);
  }, [itemMap, panZoomRotate, showActionDelay]);

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
      {showAction && (
        <ActionPane {...boundingBoxLast}>
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
      )}
      {boundingBoxLast && <BoundingBoxZone {...boundingBoxLast} />}
    </>
  );
};

export default SelectedItems;
