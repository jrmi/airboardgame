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

    const width = isNaN(givenWidth) ? firstImage.width : givenWidth;
    const height = isNaN(givenHeight) ? firstImage.height : givenHeight;

    canvas.width = width;
    canvas.height = height;

    let ratioWidth = 1,
      ratioHeight = 1;
    const center = { x: width / 2, y: height / 2 };

    // Clear canvas
    context.clearRect(0, 0, width, height);

    // Draw layers
    layers.forEach(({ offsetX = 0, offsetY = 0 }, index) => {
      const image = images[index];
      if (image) {
        if (index === 0) {
          // Draw main image
          context.drawImage(image, 0, 0, width, height);
          ratioWidth = width / image.width;
          ratioHeight = height / image.height;
        } else {
          const { width: w, height: h } = image;
          const [halfWidth, halfHeight] = [
            (w / 2) * ratioWidth,
            (h / 2) * ratioHeight,
          ];
          context.drawImage(
            image,
            center.x - halfWidth + offsetX * ratioWidth,
            center.y - halfHeight + offsetY * ratioHeight,
            w * ratioWidth,
            h * ratioHeight
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
      {rest.map(({ url, offsetX, offsetY }) => {
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

const ChooseCanvas = (props) => {
  const useCanvas = true;

  if (useCanvas) {
    return <Canvas {...props} />;
  } else {
    return <NoCanvas {...props} />;
  }
};

export default ChooseCanvas;
