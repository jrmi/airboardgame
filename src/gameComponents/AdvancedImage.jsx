import React, { memo } from "react";
import { useUsers } from "react-sync-board";
import styled from "styled-components";
import { media2Url } from "../mediaLibrary";

import eye from "../media/images/eye.svg";

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
  const canvasRef = React.useRef(null);
  const [imageBitmaps, setImageBitmaps] = React.useState({});

  const frontUrl = media2Url(front);
  const backUrl = media2Url(back);

  const loadImage = React.useCallback(async (name, url) => {
    if (url) {
      const imageBlob = await (await fetch(url)).blob();
      const imageBitmapOriginal = await createImageBitmap(imageBlob);
      const imageBitmap = structuredClone(imageBitmapOriginal);
      setImageBitmaps((prev) => ({
        ...prev,
        [name]: imageBitmap,
      }));
    } else {
      setImageBitmaps((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  }, []);

  React.useEffect(() => {
    loadImage("front", frontUrl);
  }, [frontUrl, loadImage]);

  React.useEffect(() => {
    loadImage("back", backUrl);
  }, [backUrl, loadImage]);

  React.useEffect(() => {
    if (Array.isArray(layers)) {
      layers.forEach((layer) => {
        layer.images.forEach((image, index) => {
          const imageUrl = media2Url(image);
          loadImage(`${layer.uid}__${index}`, imageUrl);
        });
      });
    }
  }, [layers, loadImage]);

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

  const size = { width, height };
  if (imageBitmaps["front"]) {
    size.width = size.width || imageBitmaps["front"].width;
    size.height = size.height || imageBitmaps["front"].height;
  } else {
    size.width = size.width || 50;
    size.height = size.height || 50;
  }

  React.useEffect(() => {
    const paint = async () => {
      let imageToDraw = "front";
      if (flippedForMe) {
        imageToDraw = "back";
      }
      if (canvasRef.current) {
        const context = canvasRef.current.getContext("2d");
        // Clear canvas
        context.clearRect(0, 0, size.width, size.height);
        if (imageBitmaps[imageToDraw]) {
          // Draw main image
          context.drawImage(
            imageBitmaps[imageToDraw],
            0,
            0,
            size.width,
            size.height
          );
        }
        // Draw layers
        layers?.forEach(({ uid, value = 0, side }) => {
          const imageName = `${uid}__${value}`;
          if (
            imageBitmaps[imageName] &&
            (side === "both" || side === imageToDraw)
          ) {
            context.drawImage(
              imageBitmaps[imageName],
              0,
              0,
              size.width,
              size.height
            );
          }
        });
      }
    };
    paint();
  }, [flippedForMe, imageBitmaps, layers, size.height, size.width]);

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
      <canvas {...size} ref={canvasRef}></canvas>
    </Wrapper>
  );
};

export default memo(AdvancedImage);
