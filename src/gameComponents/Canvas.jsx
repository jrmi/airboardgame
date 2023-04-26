import React from "react";
import styled from "styled-components";

import { getImage } from "../utils/image";

const paint = async ({
  canvas,
  width: givenWidth,
  height: givenHeight,
  layers,
}) => {
  if (canvas) {
    const context = canvas.getContext("2d");

    // Load all images
    const images = await Promise.all(layers.map(({ url }) => getImage(url)));

    const firstImage = images.find((image) => image);

    let width, height;
    let ratioWidth = 1,
      ratioHeight = 1;

    if (isNaN(givenWidth) && isNaN(givenHeight)) {
      width = firstImage.width;
      height = firstImage.height;
    } else if (isNaN(givenWidth)) {
      // Height is set
      height = givenHeight;
      ratioHeight = ratioWidth = givenHeight / firstImage.height;
      width = ratioWidth * firstImage.width;
    } else if (isNaN(givenHeight)) {
      width = givenWidth;
      ratioWidth = ratioHeight = givenWidth / firstImage.width;
      height = ratioHeight * firstImage.height;
    } else {
      ratioWidth = givenWidth / firstImage.width;
      ratioHeight = givenHeight / firstImage.height;
      width = firstImage.width * ratioWidth;
      height = firstImage.height * ratioHeight;
    }

    const originalHeigh = firstImage.height;
    const originalWidth = firstImage.width;

    canvas.width = originalWidth;
    canvas.height = originalHeigh;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    const center = { x: originalWidth / 2, y: originalHeigh / 2 };

    // Clear canvas
    context.clearRect(0, 0, originalWidth, originalHeigh);

    // Draw layers
    layers.forEach(({ offsetX = 0, offsetY = 0 }, index) => {
      const image = images[index];
      if (image) {
        if (index === 0) {
          // Draw main image
          context.drawImage(image, 0, 0, originalWidth, originalHeigh);
        } else {
          const { width: w, height: h } = image;
          const [halfWidth, halfHeight] = [w / 2, h / 2];
          context.drawImage(
            image,
            center.x - halfWidth + offsetX,
            center.y - halfHeight + offsetY,
            w,
            h
          );
        }
      }
    });
  }
};

const Canvas = ({ width, height, layers }) => {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    paint({ canvas: canvasRef.current, width, height, layers });
  }, [layers, height, width]);

  return <canvas ref={canvasRef}></canvas>;
};

const ImageElm = styled.img`
  display: block;
  pointer-events: none;
`;

const ImageWrapper = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const NoCanvas = ({ layers, width, height }) => {
  const [firstImage, ...rest] = layers;
  return (
    <div style={{ position: "relative" }}>
      <ImageElm
        src={firstImage.url}
        alt=""
        draggable={false}
        width={width}
        height={height}
      />
      {rest.map(({ url, offsetX = 0, offsetY = 0 }) => {
        return (
          <ImageWrapper key={url}>
            <ImageElm
              src={url}
              alt=""
              draggable={false}
              style={{ marginLeft: offsetX * 2, marginTop: offsetY * 2 }}
            />
          </ImageWrapper>
        );
      })}
    </div>
  );
};

const ChooseCanvas = ({ useCanvas = false, ...rest }) => {
  if (useCanvas) {
    return <Canvas {...rest} />;
  } else {
    return <NoCanvas {...rest} />;
  }
};

export default ChooseCanvas;
