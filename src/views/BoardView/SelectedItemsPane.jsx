import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

import { smallUid } from "../../utils";
import EditItemButton from "./EditItemButton";
import {
  useAvailableActions,
  useSelectionBox,
  useSelectedItems,
  useBoardState,
  useItemActions,
} from "react-sync-board";
import useGameItemActions from "../../gameComponents/useGameItemActions";

const ActionPane = styled.div.attrs(({ top, left, height }) => {
  if (top < 120) {
    return {
      style: {
        transform: `translate(${left}px, ${top + height + 5}px)`,
      },
    };
  }
  return {
    style: {
      transform: `translate(${left}px, ${top - 60}px)`,
    },
  };
})`
  top: 0;
  left: 0;
  user-select: none;
  touch-action: none;
  position: absolute;
  display: flex;
  background-color: var(--color-blueGrey);
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  padding: 0.1em 0.5em;
  
  box-shadow: 2px 2px 10px 0.3px rgba(0, 0, 0, 0.5);
  
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

const SelectedItemsPane = ({ hideMenu = false, showEdit, setShowEdit }) => {
  const { t } = useTranslation();
  const { findElementUnderPointer } = useItemActions();
  const { actionMap } = useGameItemActions();
  const { availableActions } = useAvailableActions();
  const selectedItems = useSelectedItems();
  const boardState = useBoardState();
  const selectionBox = useSelectionBox();

  const parsedAvailableActions = React.useMemo(
    () =>
      availableActions
        .map(({ name, args }) => {
          const action = { ...actionMap[name] };
          action.action = action.action(args);
          action.label = action.label(args);
          action.uid = smallUid();
          action.args = args;
          return action;
        })
        .filter(({ multiple }) => !multiple || selectedItems.length > 1),
    [actionMap, availableActions, selectedItems]
  );
  console.log(parsedAvailableActions);

  React.useEffect(() => {
    const onKeyUp = (e) => {
      // Block shortcut if we are typing in a textarea or input
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;

      if (e.key === "e") {
        setShowEdit((prev) => !prev);
        return;
      }

      for (let i = 0; i < parsedAvailableActions.length; i++) {
        const { shortcut, action, edit: whileEdit } = parsedAvailableActions[i];
        if (shortcut === e.key && (showEdit || !whileEdit)) {
          action();
          break;
        }
      }
    };
    document.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("keyup", onKeyUp);
    };
  }, [
    actionMap,
    availableActions,
    parsedAvailableActions,
    setShowEdit,
    showEdit,
  ]);

  const onDblClick = React.useCallback(
    async (e) => {
      const foundElement = await findElementUnderPointer(e);

      // We dblclick outside of an element
      if (!foundElement) return;

      // Ignore action disabled on dblclick
      const filteredActions = parsedAvailableActions.filter(
        ({ disableDblclick }) => !disableDblclick
      );

      if (e.altKey && filteredActions.length > 1) {
        // Use second action
        filteredActions[1].action();
      } else if (filteredActions.length > 0) {
        filteredActions[0].action();
      }
    },
    [findElementUnderPointer, parsedAvailableActions]
  );

  React.useEffect(() => {
    document.addEventListener("dblclick", onDblClick);
    return () => {
      document.removeEventListener("dblclick", onDblClick);
    };
  }, [onDblClick]);

  if (
    hideMenu ||
    selectedItems.length === 0 ||
    boardState.zooming ||
    boardState.panning ||
    boardState.movingItems
  ) {
    return null;
  }

  return (
    <ActionPane {...selectionBox}>
      {(selectedItems.length > 1 || boardState.selecting) && (
        <div className="count">
          <span className="number">{selectedItems.length}</span>
          <span>{t("Items")}</span>
        </div>
      )}
      {!boardState.selecting &&
        parsedAvailableActions.map(
          ({ label, action, edit: onlyEdit, shortcut, icon, uid }) => {
            if (onlyEdit && !showEdit) return null;
            return (
              <button
                className="button clear icon-only"
                key={uid}
                onClick={() => action()}
                title={label + (shortcut ? ` (${shortcut})` : "")}
              >
                <img
                  src={icon}
                  style={{ width: "32px", height: "32px" }}
                  alt={label}
                />
              </button>
            );
          }
        )}

      {!boardState.selecting && (
        <EditItemButton showEdit={showEdit} setShowEdit={setShowEdit} />
      )}
    </ActionPane>
  );
};

export default SelectedItemsPane;
