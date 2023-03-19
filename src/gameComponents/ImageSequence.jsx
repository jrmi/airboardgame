import React, { memo } from "react";
import styled from "styled-components";

import { media2Url } from "../mediaLibrary";

const ImagePane = styled.div`
  line-height: 0;
  img {
    ${({ width }) => (width ? `width: ${width}px;` : "")}
    ${({ height }) =>
      height ? `height: ${height}px;` : ""}
    pointer-events: none;
  }
  ${({ background }) =>
    background ? `background-image: url(${background});` : ""}
`;

const ImageSequence = ({
  value = 0,
  images = ["/default.png"],
  backgroundImage,
  width,
  height,
}) => {
  const backgroundUrl = media2Url(backgroundImage);

  return (
    <ImagePane width={width} height={height} background={backgroundUrl}>
      {backgroundImage && (
        <img className="bg-image" src={media2Url(images[value])} />
      )}
      {images[value] && <img src={media2Url(images[value])} />}
    </ImagePane>
  );
};

export default memo(ImageSequence);
