import React, { memo } from "react";
import { useUsers } from "react-sync-board";
import styled from "styled-components";
import { media2Url } from "../mediaLibrary";

import { FiEye } from "react-icons/fi";
import Canvas from "./Canvas";
import { getImage } from "../utils/image";

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
}) => {
  const { currentUser, localUsers: users } = useUsers();

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

  const flippable = Boolean(backContent);

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

  return (
    <Wrapper
      onMouseEnter={(e) => {
        flippable && e.target.classList.add("hvr-curl-top-right");
        e.target.classList.add("hovered");
      }}
      onMouseLeave={(e) => {
        flippable && e.target.classList.remove("hvr-curl-top-right");
        e.target.classList.remove("hovered");
      }}
    >
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
