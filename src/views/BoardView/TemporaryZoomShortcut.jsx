import React from "react";
import { useBoardPosition } from "react-sync-board";

const isTyping = (target) =>
  ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
  target.isContentEditable;

const TemporaryZoomShortcut = () => {
  const { zoomToCenter } = useBoardPosition();
  const isZoomed = React.useRef(false);

  React.useEffect(() => {
    const zoomOut = () => {
      if (!isZoomed.current) return;

      isZoomed.current = false;
      zoomToCenter({ factor: 1 / 3 });
    };

    const onKeyDown = (event) => {
      if (event.code !== "Space" || event.repeat || isTyping(event.target)) {
        return;
      }

      isZoomed.current = true;
      zoomToCenter({ factor: 3 });
      event.preventDefault();
      // react-sync-board also listens on document. Handling this in capture
      // phase keeps this shortcut independent from its pointer-hover state.
      event.stopImmediatePropagation();
    };

    const onKeyUp = (event) => {
      if (event.code !== "Space" || !isZoomed.current) return;

      zoomOut();
      event.preventDefault();
      event.stopImmediatePropagation();
    };

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("keyup", onKeyUp, true);
    window.addEventListener("blur", zoomOut);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("keyup", onKeyUp, true);
      window.removeEventListener("blur", zoomOut);
    };
  }, [zoomToCenter]);

  return null;
};

export default TemporaryZoomShortcut;
