import React from "react";
import styled from "styled-components";

import { useRecoilValue, useRecoilCallback } from "recoil";
import { useItemActions } from "./boardComponents/useItemActions";
import {
  selectedItemsAtom,
  PanZoomRotateAtom,
  BoardStateAtom,
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
  background-color: var(--bg-secondary-color);
  padding: 0.5em;
  overflow-y: scroll;
  z-index: 2;
  & .close {
    position: absolute;
    right: 0.5em;
    top: 0.5em;
  }
`;

const ActionPane = styled.div.attrs(({ top, left, height, hide }) => {
  if (top < 120) {
    return {
      style: {
        transform: `translate(${left}px, ${top + height + 20}px)`,
        opacity: hide ? 0 : 1,
      },
    };
  } else {
    return {
      style: {
        transform: `translate(${left}px, ${top - 85}px)`,
        opacity: hide ? 0 : 1,
      },
    };
  }
})`
  top: 0;
  left: 0;
  position: absolute;
  display: flex;
  background-color: var(--bg-color);
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  padding: 0.5em;
  transition: opacity 200ms;
  
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
  position: absolute;
  background-color: hsla(0, 40%, 50%, 0%);
  border: 1px dashed hsl(20, 55%, 40%);
  pointer-events: none;
`;

const BoundingBox = ({
  boundingBoxLast,
  setBoundingBoxLast,
  selectedItems,
}) => {
  const panZoomRotate = useRecoilValue(PanZoomRotateAtom);
  const itemMap = useRecoilValue(ItemMapAtom);

  // Update selection bounding box
  const updateBox = useRecoilCallback(
    ({ snapshot }) => async () => {
      const selectedItems = await snapshot.getPromise(selectedItemsAtom);

      if (selectedItems.length === 0) {
        setBoundingBoxLast(null);
        return;
      }

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
          boundingBox = { x, y, x2, y2 };
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

      if (!boundingBox) {
        setBoundingBoxLast(null);
        return;
      }

      const newBB = {
        top: boundingBox.y,
        left: boundingBox.x,
        height: boundingBox.y2 - boundingBox.y,
        width: boundingBox.x2 - boundingBox.x,
      };

      setBoundingBoxLast((prevBB) => {
        if (
          !prevBB ||
          prevBB.top !== newBB.top ||
          prevBB.left !== newBB.left ||
          prevBB.width !== newBB.width ||
          prevBB.height !== newBB.height
        ) {
          return newBB;
        }
        return prevBB;
      });
    },
    [setBoundingBoxLast]
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
    updateBox();
    updateBoxDelay(); // Delay to update after board item animation like tap/untap.
  }, [selectedItems, itemMap, panZoomRotate, updateBox, updateBoxDelay]);

  if (!boundingBoxLast || selectedItems.length < 2) return null;

  return <BoundingBoxZone {...boundingBoxLast} />;
};

export const SelectedItemsPane = () => {
  const { availableActions, actionMap } = useItemActions();
  const [showEdit, setShowEdit] = React.useState(false);

  const { t } = useTranslation();

  const selectedItems = useRecoilValue(selectedItemsAtom);
  const boardState = useRecoilValue(BoardStateAtom);
  const [boundingBoxLast, setBoundingBoxLast] = React.useState(null);

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

  const onDblClick = React.useCallback(
    (e) => {
      const foundElement = insideClass(e.target, "item");
      // We dblclick outside of an element
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

  return (
    <>
      {showEdit && !boardState.selecting && (
        <SelectedPane key={selectedItems[0]}>
          <div>
            <header>
              {selectedItems.length === 1 && <h3>{t("Edit item")}</h3>}
              {selectedItems.length > 1 && <h3>{t("Edit all items")}</h3>}
              <button
                className="button clear icon-only close"
                onClick={() => {
                  setShowEdit(false);
                }}
              >
                <img
                  src="https://icongr.am/feather/x.svg?size=30&color=ffffff"
                  alt={t("Close")}
                />
              </button>
            </header>
            <CardContent>
              <ItemFormFactory />
            </CardContent>
          </div>
        </SelectedPane>
      )}
      {selectedItems.length && (
        <ActionPane
          {...boundingBoxLast}
          hide={
            boardState.zooming || boardState.panning || boardState.movingItems
          }
        >
          {(selectedItems.length > 1 || boardState.selecting) && (
            <div className="count">
              <span className="number">{selectedItems.length}</span>
              <span>{t("Items")}</span>
            </div>
          )}
          {!boardState.selecting &&
            availableActions.map((action) => {
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

          {!boardState.selecting && (
            <button
              className="button clear icon-only"
              onClick={() => setShowEdit((prev) => !prev)}
              title={t("Edit")}
            >
              {!showEdit && (
                <img
                  src="https://icongr.am/feather/edit.svg?size=32&color=ffffff"
                  alt={t("Edit")}
                />
              )}
              {showEdit && (
                <img
                  src="https://icongr.am/feather/edit.svg?size=32&color=db5034"
                  alt={t("Edit")}
                />
              )}
            </button>
          )}
        </ActionPane>
      )}
      <BoundingBox
        boundingBoxLast={boundingBoxLast}
        setBoundingBoxLast={setBoundingBoxLast}
        selectedItems={selectedItems}
      />
    </>
  );
};

export default SelectedItemsPane;
