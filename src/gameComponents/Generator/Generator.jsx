import React, { memo } from "react";
import styled, { css } from "styled-components";
import { FiMove } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import debounce from "lodash.debounce";

import itemTemplates from "../itemTemplates";
import useGeneratedItem from "./useGeneratedItem";

const StyledShape = styled.div`
  ${({ $color }) => css`
    box-shadow:
      rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
      rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
    border: 3px dashed black;
    border-color: ${$color};

    border-radius: 3px;
    background-color: #cccccc22;

    & .wrapper {
      opacity: 0.3;
      position: relative;
    }

    & .item-wrapper {
      position: absolute;
      top: ${({ $center: { top } }) => `${top}px`};
      left: ${({ $center: { left } }) => `${left}px`};
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
  const itemRef = React.useRef(null);
  const [dimension, setDimension] = React.useState({
    width: 50,
    height: 50,
  });
  const [center, setCenter] = React.useState({ top: 0, left: 0 });
  const centerRef = React.useRef(center);
  Object.assign(centerRef.current, center);
  const { currentItemId: generatedItemId, currentItemRef: generatedItemRef } =
    useGeneratedItem({
      id,
      item,
      currentItemId,
      setState,
      generatorElement: itemRef,
      centerRef,
    });

  /**
   * Set generator dimension according to Item content.
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const resize = React.useCallback(
    debounce((rotation) => {
      let targetWidth, targetHeight;

      if (!itemRef.current) {
        // The component is probably unmounted
        return;
      }

      const { clientWidth, clientHeight } = itemRef.current;
      targetWidth = clientWidth;
      targetHeight = clientHeight;

      if (generatedItemRef.current) {
        // Get size from current item if any
        const currentDomItem = document.getElementsByClassName(
          `item ${generatedItemRef.current}`
        )[0];
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

      const nextCenter = { top, left };
      setCenter((previous) => {
        if (previous.top === top && previous.left === left) {
          return previous;
        }
        return nextCenter;
      });
      centerRef.current = nextCenter;

      setDimension((previous) => {
        if (previous.width === width && previous.height === height) {
          return previous;
        }
        return { width, height };
      });
    }, 100),
    [generatedItemRef]
  );

  React.useEffect(() => () => resize.cancel(), [resize]);

  React.useEffect(() => {
    /**
     * Update center and generator width height
     */
    resize(item?.rotation);
  }, [item, resize]);

  // Define item component if type is defined
  let Item = () => (
    <div className="generator__empty-message">{t("No item type defined")}</div>
  );
  if (item?.type && itemTemplates[item.type]) {
    const itemTemplate = itemTemplates[item.type];
    Item = itemTemplate.component;
  }

  return (
    <StyledShape
      $color={color}
      $center={center}
      data-generator-id={id}
      data-current-item-id={generatedItemId || ""}
      data-generator-child-id={generatedItemId || ""}
    >
      <div className="handle">
        <FiMove size="20" color="white" />
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
