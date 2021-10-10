import React, { memo } from "react";
import styled, { css } from "styled-components";
import { useItemActions, useItemInteraction } from "react-sync-board";

import { uid } from "../utils";
import itemTemplates from "./itemTemplates";

const StyledShape = styled.div`
  ${({ color }) => css`
    box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
      rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
    border: 3px dashed black;
    border-color: ${color};

    & .wrapper {
      opacity: 0.3;
    }
    & .handle {
      position: absolute;
      top: -15px;
      left: -15px;
      user-select: none;
      & img {
        pointer-events: none;
      }
    }
  `}
`;

const Generator = ({ color = "#ccc", item, id, currentItemId, setState }) => {
  const {
    pushItem,
    getItems,
    batchUpdateItems,
    removeItems,
  } = useItemActions();
  const { register } = useItemInteraction("place");

  const addItem = React.useCallback(async () => {
    const [thisItem] = await getItems([id]);
    if (item?.type) {
      const newItemId = uid();
      setState((prev) => ({ ...prev, currentItemId: newItemId }));
      pushItem({
        ...item,
        x: thisItem.x + 3,
        y: thisItem.y + 3,
        id: newItemId,
      });
    }
  }, [getItems, id, item, pushItem, setState]);

  const onPlaceItem = React.useCallback(
    async (itemIds) => {
      const placeSelf = itemIds.includes(id);
      if (itemIds.includes(currentItemId) && !placeSelf) {
        addItem();
      }
      if (placeSelf) {
        if (!currentItemId) {
          addItem();
        } else {
          const [thisItem] = await getItems([id]);
          batchUpdateItems([currentItemId], (item) => {
            return {
              ...item,
              x: thisItem.x + 3,
              y: thisItem.y + 3,
            };
          });
        }
      }
    },
    [addItem, batchUpdateItems, currentItemId, getItems, id]
  );

  React.useEffect(() => {
    if (!currentItemId) {
      addItem();
    }
  }, [addItem, currentItemId]);

  React.useEffect(() => {
    const checkType = async () => {
      if (currentItemId) {
        const [currentItem] = await getItems([currentItemId]);
        if (currentItem?.type !== item.type) {
          if (currentItem) {
            // Remove old if exists
            await removeItems([currentItemId]);
          }
          // Add new item
          await addItem();
        }
      }
    };
    if (item?.type) {
      checkType();
    }
  }, [addItem, currentItemId, getItems, item?.type, removeItems]);

  React.useEffect(() => {
    const unregisterList = [];
    if (item) {
      unregisterList.push(register(onPlaceItem));
    }
    return () => {
      unregisterList.forEach((callback) => callback());
    };
  }, [register, item, onPlaceItem]);

  let Item = () => <div>Please define item type.</div>;
  if (item) {
    const itemTemplate = itemTemplates[item.type];
    Item = itemTemplate.component;
  }

  return (
    <StyledShape color={color}>
      <div className="handle">
        <img src="https://icongr.am/clarity/cursor-move.svg?size=20&color=ffffff" />
      </div>
      <div className="wrapper">
        <Item {...item} />
      </div>
    </StyledShape>
  );
};

export default memo(Generator);
