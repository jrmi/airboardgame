import React, { memo } from "react";
import { useUsers } from "../users";
import styled from "styled-components";

import eye from "../../images/eye.svg";

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

const Wrapper = styled.div.attrs(({ flippable }) => ({
  className: flippable ? "hvr-curl-top-right" : "",
}))`
  user-select: none;
  position: relative;
  line-height: 0em;
`;

const FrontImage = styled.img`
  transition: transform 200ms, opacity 200ms;
  transform: rotateY(${({ visible }) => (visible ? 0 : 180)}deg);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  pointer-events: none;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
`;

const BackImage = styled(FrontImage)`
  position: absolute;
  top: 0;
  left: 0;
`;

const OverlayImage = styled.img`
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
`;

// See https://stackoverflow.com/questions/3680429/click-through-div-to-underlying-elements
// https://developer.mozilla.org/fr/docs/Web/CSS/pointer-events
const Image = ({
  width,
  height,
  content = "/default.png",
  backContent,
  flipped = false,
  unflippedFor,
  text,
  backText,
  overlay,
}) => {
  const { currentUser, users } = useUsers();

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
        .filter((userId) => users.find(({ id }) => userId === id))
        .map((userId) => users.find(({ id }) => userId === id));
    }
    return null;
  }, [unflippedFor, users]);

  const flippedForMe =
    backContent &&
    flipped &&
    (!Array.isArray(unflippedFor) || !unflippedFor.includes(currentUser.id));

  const flippable = Boolean(backContent);

  return (
    <Wrapper flippable={flippable}>
      <UnflippedFor>
        {unflippedForUsers &&
          unflippedForUsers.map(({ color, id }) => {
            return <UnflippedForUser key={id} src={eye} color={color} />;
          })}
      </UnflippedFor>
      <FrontImage
        visible={!flippedForMe}
        src={content}
        alt=""
        draggable={false}
        {...size}
      />
      <BackImage
        visible={flippedForMe}
        src={backContent}
        alt=""
        draggable={false}
        {...size}
      />
      {overlay && overlay.content && (
        <OverlayImage
          src={overlay.content}
          draggable={false}
          alt=""
          {...size}
        />
      )}
      {flippedForMe && backText && <Label>{backText}</Label>}
      {(!flippedForMe || !backText) && text && <Label>{text}</Label>}
    </Wrapper>
  );
};

export default memo(Image);
