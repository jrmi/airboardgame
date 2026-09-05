import React, { memo } from "react";
import { useUsers } from "react-sync-board";
import styled from "styled-components";
import { FiEye } from "react-icons/fi";
import { useItemInteraction, useItemActions } from "react-sync-board";

import { getHeldItems, captureHeldReferences } from "../../utils/item";
import Canvas from "../Canvas";
import { media2Url } from "../../mediaLibrary";
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

const Wrapper = styled.div`
  user-select: none;
  position: relative;
  line-height: 0em;
`;

// See https://stackoverflow.com/questions/3680429/click-through-div-to-underlying-elements
// https://developer.mozilla.org/fr/docs/Web/CSS/pointer-events
const Image = ({
  width,
  height,
  content = "/default.png",
  backContent: rawBackContent,
  flipped = false,
  unflippedFor,
  text,
  backText,
  overlay,
  setState,
  id: currentItemId,
}) => {
  const { currentUser, localUsers: users } = useUsers();
  const { register: registerPlace } = useItemInteraction("place");
  const { register: registerDelete } = useItemInteraction("delete");
  const { getItemList, batchUpdateItems } = useItemActions();

  const wrapperRef = React.useRef(null);

  const imageContent = media2Url(content) || "/default.png";
  const backContent = media2Url(rawBackContent);
  const overlayContent = media2Url(overlay?.content);

  const size = {};

  if (width) {
    size.width = width;
  }
  if (height) {
    size.height = height;
  }

  const unflippedForUsers = React.useMemo(() => {
    if (Array.isArray(unflippedFor)) {
      return unflippedFor
        .filter((userId) => users.find(({ uid }) => userId === uid))
        .map((userId) => users.find(({ uid }) => userId === uid));
    }
    return null;
  }, [unflippedFor, users]);

  const flippedForMe =
    backContent &&
    flipped &&
    (!Array.isArray(unflippedFor) || !unflippedFor.includes(currentUser.uid));

  const layers = React.useMemo(() => {
    const result = [];
    if (!flippedForMe) {
      result.push({ url: imageContent });
    } else {
      result.push({ url: backContent });
    }
    if (overlayContent) {
      result.push({ url: overlayContent });
    }
    return result;
  }, [backContent, flippedForMe, imageContent, overlayContent]);

  React.useEffect(() => {
    // preload images
    getImage(imageContent);
    if (backContent) {
      getImage(backContent);
    }
  }, [imageContent, backContent]);

  const onPlaceItem = React.useCallback(
    (itemIds) => {
      let newlyHeldIds = null;
      setState((item) => {
        const previousLinkedItems = item.linkedItems;
        const newLinkedItems = getHeldItems({
          element: wrapperRef.current,
          currentItemId,
          currentLinkedItemIds: previousLinkedItems,
          itemList: getItemList(),
          itemIds,
          shouldHoldItems: item.holdItems,
        });
        if (previousLinkedItems !== newLinkedItems) {
          const previousIds = new Set(previousLinkedItems || []);
          newlyHeldIds = newLinkedItems.filter((id) => !previousIds.has(id));
          return {
            linkedItems: newLinkedItems,
          };
        }
      }, true);

      // Capture, on each newly held item, the offset/angle it was placed
      // with so future rotations of this holder stay precise (see
      // captureHeldReferences).
      if (newlyHeldIds && newlyHeldIds.length > 0) {
        const references = captureHeldReferences({
          holderId: currentItemId,
          heldIds: newlyHeldIds,
          itemList: getItemList(),
        });
        if (references) {
          batchUpdateItems(
            Object.keys(references),
            (heldItem) => references[heldItem.id],
            true
          );
        }
      }
    },
    [currentItemId, getItemList, setState, batchUpdateItems]
  );

  const onDeleteItem = React.useCallback(
    (itemIds) => {
      setState((item) => {
        const safeLinkedItems = item.linkedItems || [];
        const newLinkedItems = safeLinkedItems.filter(
          (id) => !itemIds.includes(id)
        );

        if (safeLinkedItems.length !== newLinkedItems.length) {
          return {
            linkedItems: newLinkedItems,
          };
        }
      }, true);
    },
    [setState]
  );

  React.useEffect(() => {
    const unregisterList = [];
    if (currentItemId) {
      unregisterList.push(registerPlace(onPlaceItem));
    }

    return () => {
      unregisterList.forEach((callback) => callback());
    };
  }, [currentItemId, onPlaceItem, registerPlace]);

  React.useEffect(() => {
    const unregisterList = [];
    if (currentItemId) {
      unregisterList.push(registerDelete(onDeleteItem));
    }

    return () => {
      unregisterList.forEach((callback) => callback());
    };
  }, [currentItemId, onDeleteItem, registerDelete]);

  return (
    <Wrapper ref={wrapperRef}>
      <Canvas layers={layers} width={width} height={height} />

      {flippedForMe && backText && <Label>{backText}</Label>}
      {(!flippedForMe || !backText) && text && <Label>{text}</Label>}
      {unflippedForUsers && (
        <UnflippedFor>
          {unflippedForUsers.map(({ color, id }) => {
            return (
              <UnflippedForUser key={id} color={color}>
                <FiEye color="white" size="16" />
              </UnflippedForUser>
            );
          })}
        </UnflippedFor>
      )}
    </Wrapper>
  );
};

export default memo(Image);
