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

  const loadImage = React.useCallback(async (name, url, imageBitmapsParam) => {
    if (url) {
      if (imageBitmapsParam[name]?.url !== url) {
        const img = new Image();
        img.onload = () => {
          setImageBitmaps((prev) => ({
            ...prev,
            [name]: { image: img, url },
          }));
        };
        img.src = url;

        setImageBitmaps((prev) => ({
          ...prev,
          [name]: { url },
        }));
      }
    } else {
      setImageBitmaps((prev) => {
        if (prev[name]) {
          const next = { ...prev };
          delete next[name];
          return next;
        } else {
          return prev;
        }
      });
    }
  }, []);

  React.useEffect(() => {
    loadImage("front", frontUrl, imageBitmaps);
  }, [frontUrl, imageBitmaps, loadImage]);

  React.useEffect(() => {
    loadImage("back", backUrl, imageBitmaps);
  }, [backUrl, imageBitmaps, loadImage]);

  React.useEffect(() => {
    if (Array.isArray(layers)) {
      layers.forEach((layer) => {
        layer.images.forEach((image, index) => {
          const imageUrl = media2Url(image);
          loadImage(`${layer.uid}__${index}`, imageUrl, imageBitmaps);
        });
      });
    }
  }, [imageBitmaps, layers, loadImage]);

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
    size.width = size.width || imageBitmaps["front"].image.width;
    size.height = size.height || imageBitmaps["front"].image.height;
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
        let ratioWidth = 1,
          ratioHeight = 1;
        if (imageBitmaps[imageToDraw]?.image) {
          const { image } = imageBitmaps[imageToDraw];
          // Draw main image
          context.drawImage(image, 0, 0, size.width, size.height);
          ratioWidth = size.width / image.width;
          ratioHeight = size.height / image.height;
        }

        const center = { x: size.width / 2, y: size.height / 2 };
        // Draw layers
        layers?.forEach(
          ({ uid, value = 0, side, offsetX = 0, offsetY = 0 }) => {
            const imageName = `${uid}__${value}`;
            if (
              imageBitmaps[imageName]?.image &&
              (side === "both" || side === imageToDraw)
            ) {
              const { image } = imageBitmaps[imageName];
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
        );
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
