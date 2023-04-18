import React, { memo } from "react";
import { useUsers } from "react-sync-board";
import styled from "styled-components";
import { media2Url } from "../mediaLibrary";

import eye from "../media/images/eye.svg";

import Canvas from "./Canvas";

const UnflippedFor = styled.div`
  position: absolute;
  top: -34px;
  right: 2px;
  color: #555;
  font-size: 0.6em;
  display: flex;
  justify-content: center;
  align-items: center;

  pointer-events: none;
  line-height: 1.5em;
`;

const UnflippedForUser = styled.img`
  background-color: ${({ color }) => color};
  border-radius: 2px;
  padding: 2px;
  margin: 2px;
`;

const Wrapper = styled.div`
  user-select: none;
  position: relative;
  line-height: 0em;
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
  layers,
}) => {
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

  const flippable = Boolean(backUrl);

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
      <UnflippedFor>
        {unflippedForUsers &&
          unflippedForUsers.map(({ color, id }) => {
            return <UnflippedForUser key={id} src={eye} color={color} />;
          })}
      </UnflippedFor>
      <Canvas
        layers={canvasLayers}
        width={width}
        height={height}
        useCanvas={true}
      />
    </Wrapper>
  );
};

export default memo(AdvancedImage);
