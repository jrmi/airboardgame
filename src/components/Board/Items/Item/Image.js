import React, { memo } from "react";
import { useUsers } from "../../../../components/users";
import styled from "styled-components";

const OnlyYouLabel = styled.div`
  position: absolute;
  top: -20px;
  right: 2px;
  color: #555;
  font-size: 0.6em;

  background-color: #cccccca0;
  pointer-events: none;
  line-height: 1.5em;
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
  const { currentUser } = useUsers();
  const size = {};
  if (width) {
    size.width = width;
  }
  if (height) {
    size.height = height;
  }

  const flippedForMe =
    backContent && flipped && unflippedFor !== currentUser.id;

  return (
    <Wrapper>
      {unflippedFor === currentUser.id && <OnlyYouLabel>Only you</OnlyYouLabel>}
      {flippedForMe && backText && <Label>{backText}</Label>}
      {(!flippedForMe || !backText) && text && <Label>{text}</Label>}
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
    </Wrapper>
  );
};

export default memo(Image);
