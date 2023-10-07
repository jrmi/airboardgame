import React, { memo } from "react";
import { useUsers } from "react-sync-board";
import styled from "styled-components";
import { media2Url } from "../../mediaLibrary";
import { FiEye } from "react-icons/fi";
import { useItemInteraction } from "react-sync-board";

import { isItemInsideElement, getItemElement } from "../../utils";
import Canvas from "../Canvas";
import { getImage } from "../../utils/image";

const UnflippedFor = styled.div`
  position: absolute;
  top: 2px;
  right: 2px;
  color: #555;
  font-size: 0.6em;
  display: flex;
  justify-content: center;
  align-items: center;

  pointer-events: none;
  line-height: 0;
  opacity: 0.6;
`;

const UnflippedForUser = styled.div`
  background-color: ${({ color }) => color};
  color: white;
  border-radius: 3px;
  padding: 4px;
  margin: 4px;
`;

const Wrapper = styled.div`
  user-select: none;
  position: relative;
  line-height: 0em;
`;

const Label = styled.div`
  position: absolute;
  top: 1px;
  right: 1px;
  padding: 0 3px;
  background-color: black;
  color: white;
  border-radius: 0.5em;
  opacity: 0.5;
  font-size: 0.6em;
  line-height: 1.5em;
`;

/*

const layer={
  name: 'ttt',
  images: {...}
  side: "front"|"back"|"both"
  offset: {x, y}
  uid: ''
}

*/

const AdvancedImage = ({
  width,
  height,
  front,
  back,
  flipped = false,
  unflippedFor,
  holdItems,
  setState,
  text,
  backText,
  layers,
}) => {
  const { register } = useItemInteraction("place");
  const wrapperRef = React.useRef(null);
  const { currentUser, localUsers: users } = useUsers();

  const frontUrl = media2Url(front);
  const backUrl = media2Url(back);

  const unflippedForUsers = React.useMemo(() => {
    if (Array.isArray(unflippedFor)) {
      return unflippedFor
        .filter((userId) => users.find(({ uid }) => userId === uid))
        .map((userId) => users.find(({ uid }) => userId === uid));
    }
    return null;
  }, [unflippedFor, users]);

  const flippedForMe =
    backUrl &&
    flipped &&
    (!Array.isArray(unflippedFor) || !unflippedFor.includes(currentUser.uid));

  const canvasLayers = React.useMemo(() => {
    const result = [];
    if (flippedForMe) {
      result.push({ url: backUrl });
    } else {
      result.push({ url: frontUrl });
    }
    layers?.forEach(({ value = 0, images, side, offsetX = 0, offsetY = 0 }) => {
      if (
        side === "both" ||
        (side === "front" && !flippedForMe) ||
        (side === "back" && flippedForMe)
      ) {
        const currentImage = images[value];
        const url = media2Url(currentImage);
        result.push({ url, offsetX, offsetY });
      }
    });
    return result;
  }, [backUrl, flippedForMe, frontUrl, layers]);

  React.useEffect(() => {
    // preload images
    getImage(frontUrl);
    if (backUrl) {
      getImage(backUrl);
    }
  }, [frontUrl, backUrl]);

  const onInsideItem = React.useCallback(
    (itemIds) => {
      const whetherItemIsInside = Object.fromEntries(
        itemIds.map((itemId) => [
          itemId,
          isItemInsideElement(getItemElement(itemId), wrapperRef.current),
        ])
      );
      const insideItems = itemIds.filter(
        (itemId) => whetherItemIsInside[itemId]
      );

      if (holdItems) {
        setState((item) => {
          const { linkedItems = [] } = item;
          // Remove outside items from linkedItems
          const linkedItemsCleaned = linkedItems.filter(
            (itemId) => whetherItemIsInside[itemId] !== false
          );
          const newLinkedItems = Array.from(
            new Set(linkedItemsCleaned.concat(insideItems))
          );

          return {
            ...item,
            linkedItems: newLinkedItems,
          };
        });
      }
    },
    [holdItems, setState]
  );

  React.useEffect(() => {
    const unregisterList = [];
    unregisterList.push(register(onInsideItem));

    return () => {
      unregisterList.forEach((callback) => callback());
    };
  }, [onInsideItem, register]);

  return (
    <Wrapper ref={wrapperRef}>
      <Canvas
        layers={canvasLayers}
        width={width}
        height={height}
        useCanvas={true}
      />
      {flippedForMe && backText && <Label>{backText}</Label>}
      {(!flippedForMe || !backText) && text && <Label>{text}</Label>}
      <UnflippedFor>
        {unflippedForUsers &&
          unflippedForUsers.map(({ color, id }) => {
            return (
              <UnflippedForUser key={id} color={color}>
                <FiEye color="white" size="16" />
              </UnflippedForUser>
            );
          })}
      </UnflippedFor>
    </Wrapper>
  );
};

export default memo(AdvancedImage);
