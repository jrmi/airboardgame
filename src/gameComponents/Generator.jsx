import React, { memo } from "react";
import styled, { css } from "styled-components";
import { useItemActions, useItemInteraction, useWire } from "react-sync-board";

import { uid, getItemElement } from "../utils";
import itemTemplates from "./itemTemplates";
import { useTranslation } from "react-i18next";
import debounce from "lodash.debounce";

const StyledShape = styled.div`
  ${({ color }) => css`
    box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
      rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
    border: 3px dashed black;
    border-color: ${color};

    border-radius: 3px;
    background-color: #cccccc22;

    & .wrapper {
      opacity: 0.3;
      position: relative;
    }

    & .item-wrapper {
      position: absolute;
      top: ${({ center: { top } }) => `${top}px`};
      left: ${({ center: { left } }) => `${left}px`};
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

    & .generator__empty-message {
      display: block;
      width: 60px;
      height: 60px;
      font-size: 0.65em;
      text-align: center;

      .item-library__component & {
        visibility: hidden;
      }
    }
  `}
`;

const Generator = ({ color = "#ccc", item, id, currentItemId, setState }) => {
  const { t } = useTranslation();
  const { isMaster } = useWire("board");
  const itemRef = React.useRef(null);
  const [dimension, setDimension] = React.useState({
    width: 50,
    height: 50,
  });
  const [center, setCenter] = React.useState({ top: 0, left: 0 });
  const { register } = useItemInteraction("place");
  const {
    pushItem,
    getItems,
    batchUpdateItems,
    removeItems,
  } = useItemActions();

  const centerRef = React.useRef(center);
  Object.assign(centerRef.current, center);
  const currentItemRef = React.useRef(currentItemId);
  currentItemRef.current = currentItemId;

  const addItem = React.useCallback(async () => {
    /**
     * Add new generated item
     */
    const [thisItem] = await getItems([id]);
    const { item } = thisItem || {}; // Inside item library, thisItem is not defined
    if (item?.type) {
      const newItemId = uid();
      await pushItem({
        ...item,
        x: thisItem.x + centerRef.current.left + 3,
        y: thisItem.y + centerRef.current.top + 3,
        layer: thisItem.layer + 1,
        editable: false,
        id: newItemId,
      });
      currentItemRef.current = newItemId;
      setState((prev) => ({ ...prev, currentItemId: newItemId }));
    }
  }, [getItems, id, pushItem, setState]);

  const centerItem = React.useCallback(async () => {
    /**
     * Center generated item
     */
    const [thisItem, other] = await getItems([id, currentItemRef.current]);
    if (!other) {
      // Item has been deleted, need a new one.
      currentItemRef.current = undefined;
      setState((prev) => ({ ...prev, currentItemId: undefined }));
    } else {
      batchUpdateItems([currentItemRef.current], (item) => {
        const newX = thisItem.x + centerRef.current.left + 3;
        const newY = thisItem.y + centerRef.current.top + 3;
        /* Prevent modification if item doesn't need update */
        if (
          newX !== item.x ||
          newY !== item.y ||
          item.layer !== thisItem.layer + 1
        ) {
          return {
            ...item,
            x: newX,
            y: newY,
            layer: thisItem.layer + 1,
          };
        }
        return item;
      });
    }
  }, [batchUpdateItems, getItems, id, setState]);

  const onPlaceItem = React.useCallback(
    async (itemIds) => {
      /**
       * Callback if generated item or generator is placed
       */
      const placeSelf = itemIds.includes(id);
      if (itemIds.includes(currentItemRef.current) && !placeSelf) {
        // We have removed generated item so we create a new one.
        const [thisItem] = await getItems([id]);
        batchUpdateItems([currentItemRef.current], (item) => {
          const result = {
            ...item,
            layer: thisItem.layer,
          };
          delete result.editable;
          return result;
        });
        await addItem();
      }
      if (placeSelf) {
        if (!currentItemRef.current) {
          // Missing item for any reason
          await addItem();
        } else {
          // We are moving generator so we must
          // update generated item position
          await centerItem();
        }
      }
    },
    [addItem, batchUpdateItems, centerItem, getItems, id]
  );

  /**
   * Set generator dimension according to Item content.
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const resize = React.useCallback(
    debounce((rotation) => {
      let targetWidth, targetHeight;
      const { clientWidth, clientHeight } = itemRef.current;
      targetWidth = clientWidth;
      targetHeight = clientHeight;

      if (currentItemRef.current) {
        // Get size from current item if any
        const currentDomItem = getItemElement(currentItemRef.current);
        if (currentDomItem) {
          targetWidth = currentDomItem.clientWidth;
          targetHeight = currentDomItem.clientHeight;
        }
      }

      /* Compute size relative to rotation */
      const rad = (rotation || 0) * (Math.PI / 180);

      const cos = Math.abs(Math.cos(rad));
      const sin = Math.abs(Math.sin(rad));

      const width = targetWidth * cos + targetHeight * sin;
      const height = targetWidth * sin + targetHeight * cos;

      const top = -targetHeight / 2 + height / 2 + 3;
      const left = -targetWidth / 2 + width / 2 + 3;

      setCenter({
        top,
        left,
      });
      centerRef.current = {
        top,
        left,
      };

      setDimension((prev) => ({ ...prev, width, height }));
    }, 100),
    []
  );

  React.useEffect(() => {
    /**
     * update item on modifications only if master
     */
    if (item?.type && isMaster) {
      batchUpdateItems([currentItemRef.current], (prev) => ({
        ...prev,
        ...item,
      }));
    }
  }, [batchUpdateItems, isMaster, item]);

  React.useEffect(() => {
    /**
     * Add item if missing
     */
    if (isMaster && !currentItemId && item?.type) {
      addItem();
    }
  }, [addItem, currentItemId, isMaster, item?.type]);

  React.useEffect(() => {
    /**
     * Check if type is defined
     */
    const checkType = async () => {
      if (currentItemRef.current) {
        const [currentItem] = await getItems([currentItemRef.current]);
        if (currentItem?.type !== item.type) {
          if (currentItem) {
            // Remove old if exists
            await removeItems([currentItemRef.current]);
          }
          // Add new item on new type
          await addItem();
        }
      }
    };

    if (item?.type && isMaster) {
      checkType();
    }
  }, [addItem, getItems, item?.type, removeItems, isMaster]);

  React.useEffect(() => {
    /**
     * Register onPlaceItem callback
     */
    const unregisterList = [];
    if (currentItemId) {
      unregisterList.push(register(onPlaceItem));
    }
    return () => {
      unregisterList.forEach((callback) => callback());
    };
  }, [register, onPlaceItem, currentItemId]);

  React.useEffect(() => {
    /**
     * Update center and generator width height
     */
    resize(item?.rotation);
  }, [item, resize, dimension.height, dimension.width]);

  React.useEffect(() => {
    if (currentItemRef.current && isMaster) {
      centerItem();
    }
  }, [item, centerItem, isMaster, center]);

  // Define item component if type is defined
  let Item = () => (
    <div className="generator__empty-message">{t("No item type defined")}</div>
  );
  if (item) {
    const itemTemplate = itemTemplates[item.type];
    Item = itemTemplate.component;
  }

  return (
    <StyledShape color={color} center={center}>
      <div className="handle">
        <img src="https://icongr.am/clarity/cursor-move.svg?size=20&color=ffffff" />
      </div>
      <div className="wrapper" style={dimension}>
        <div
          style={{
            transform: `rotate(${item?.rotation || 0}deg)`,
          }}
          ref={itemRef}
          className="item-wrapper"
        >
          <Item {...item} />
        </div>
      </div>
    </StyledShape>
  );
};

export default memo(Generator);
