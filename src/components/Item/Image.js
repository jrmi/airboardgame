import React, { memo } from "react";
import { useRecoilValue } from "recoil";
import { userAtom } from "../../hooks/useUser";

// See https://stackoverflow.com/questions/3680429/click-through-div-to-underlying-elements
// https://developer.mozilla.org/fr/docs/Web/CSS/pointer-events
const Image = ({
  width,
  height,
  content,
  backContent,
  flipped,
  updateState,
  unflippedFor,
  text,
  backText,
  overlay,
}) => {
  const user = useRecoilValue(userAtom);
  const size = {};
  if (width) {
    size.width = width;
  }
  if (height) {
    size.height = height;
  }

  const onDblClick = React.useCallback(
    (e) => {
      if (e.ctrlKey) {
        updateState((prevItem) => {
          if (prevItem.unflippedFor !== null) {
            return { ...prevItem, unflippedFor: null };
          } else {
            return { ...prevItem, unflippedFor: user.id, flipped: false };
          }
        });
      } else {
        updateState((prevItem) => ({
          ...prevItem,
          flipped: !prevItem.flipped,
          unflippedFor: null,
        }));
      }
    },
    [updateState, user.id]
  );

  let image;
  if (backContent && (flipped || (unflippedFor && unflippedFor !== user.id))) {
    image = (
      <>
        {text && (
          <div
            className="image-text"
            style={{
              position: "absolute",
              right: 0,
              padding: "0 3px",
              backgroundColor: "black",
              color: "white",
              borderRadius: "50%",
              userSelect: "none",
            }}
          >
            {backText}
          </div>
        )}
        <img
          src={backContent}
          alt=""
          draggable={false}
          {...size}
          style={{ userSelect: "none", pointerEvents: "none" }}
        />
      </>
    );
  } else {
    image = (
      <div className="image-wrapper" style={{ position: "relative" }}>
        {unflippedFor && (
          <div
            style={{
              position: "absolute",
              top: "-18px",
              left: "4px",
              color: "#555",
              backgroundColor: "#CCCCCCA0",
              userSelect: "none",
              pointerEvents: "none",
            }}
          >
            Only you
          </div>
        )}
        {overlay && (
          <img
            src={overlay.content}
            alt=""
            style={{
              position: "absolute",
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
        )}
        {text && (
          <div
            className="image-text"
            style={{
              position: "absolute",
              right: 0,
              padding: "0 3px",
              backgroundColor: "black",
              color: "white",
              borderRadius: "50%",
              userSelect: "none",
            }}
          >
            {text}
          </div>
        )}
        <img
          src={content}
          alt=""
          draggable={false}
          {...size}
          style={{ userSelect: "none", pointerEvents: "none" }}
        />
      </div>
    );
  }

  return <div onDoubleClick={onDblClick}>{image}</div>;
};

export default memo(Image);
