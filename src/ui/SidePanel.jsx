import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";

import { FiX } from "react-icons/fi";

const StyledSidePanel = styled.div`
  position: fixed;

  top: 40px;
  bottom: 0;
  z-index: ${({ $layer }) => 213 + $layer};
  display: flex;
  flex-direction: column;
  height: calc(100% - 40px);
  max-height: calc(100% - 40px);
  overflow: hidden;

  background-color: var(--color-board-panel);
  border-right: 1px solid var(--color-board-border);

  box-shadow: 8px 0 24px rgba(0, 0, 0, 0.38);

  min-width: 280px;
  max-width: 500px;
  width: ${({ $width }) => ($width ? `${$width}` : "25%")};

  overflow-y: auto;

  transform: translateX(100%);
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);

  &.side-panel--left {
    left: 0px;
    transform: translateX(-100%);
  }

  &.side-panel--right {
    right: 0;
    transform: translateX(100%);
    border-right: 0;
    border-left: 1px solid var(--color-board-border);
  }

  &.side-panel--open {
    transform: translateX(0%);
  }

  opacity: 0.2;
  &.side-panel--open {
    opacity: 1;
  }

  .side-panel__close {
    position: absolute;
    top: 0;
  }

  &.side-panel--left .side-panel__close {
    right: 10px;
  }

  &.side-panel--right .side-panel__close {
    left: 0px;
  }

  .side-panel__title {
    font-weight: 700;
    padding: 0.5em;
    margin: 0;
  }

  &.side-panel--right .side-panel__title {
    margin-left: 35px;
  }

  .side-panel__content {
    flex: 1;
    overflow: auto;
    ${({ $noMargin }) => ($noMargin ? "" : "padding: 1em")};
    & header {
      padding: 0.5em;
      margin-top: 2em;
      background-color: var(--color-board-panel-raised);
      border: 1px solid var(--color-board-border);
      border-bottom: 0;
      border-radius: 0.5em 0.5em 0em 0em;
      & h3 {
        margin: 0.2em 0.2em 0.2em;
        font-weight: 300;
      }
    }

    & header:first-child {
      margin-top: 0;
    }

    & section {
      border-radius: 0em 0em 0.5em 0.5em;
      padding: 1em;
      background-color: var(--color-board-panel-inset);
      border: 1px solid var(--color-board-border);
    }
  }

  .side-panel__footer {
    margin-top: 1em;
  }
`;

const SidePanel = ({
  children,
  position,
  noMargin,
  onClose = () => {},
  onPointerDown,
  title,
  footer,
  show,
  open = show,
  width,
  canClose = true,
  layer = 0,
}) => {
  const { t } = useTranslation();

  const [state, setState] = React.useState("closed");

  const onAnimationEnd = React.useCallback(() => {
    setState((prev) => {
      if (prev === "closing") return "closed";
      if (prev === "opening") return "open";
      return prev;
    });
  }, []);

  React.useEffect(() => {
    setState((prev) => {
      if (prev === "closed" && open) return "opening";
      if ((prev === "open" || prev === "opening") && !open) return "closing";
      return prev;
    });
  }, [open]);

  const [bindTo] = React.useState(() =>
    document.getElementById("panel-container")
  );

  if (!bindTo || (state === "closed" && !open)) {
    return null;
  }

  const classes = [];

  if (state === "opening" || state === "open") {
    classes.push("side-panel--open");
  }

  if (position === "right") {
    classes.push("side-panel--right");
  } else {
    classes.push("side-panel--left");
  }

  return createPortal(
    <StyledSidePanel
      onTransitionEnd={onAnimationEnd}
      onPointerDown={onPointerDown}
      $noMargin={noMargin}
      $width={width}
      className={classes.join(" ")}
      $layer={layer}
    >
      <header className="side-panel__header">
        {title && <h2 className="side-panel__title">{title}</h2>}
        <button
          className="button clear icon-only side-panel__close"
          onClick={() => {
            canClose && onClose();
          }}
        >
          <FiX size={42} alt={t("Close")} color="white" />
        </button>
      </header>
      <div className="side-panel__content">{children}</div>
      {footer && <footer className="side-panel__footer">{footer}</footer>}
    </StyledSidePanel>,
    bindTo
  );
};

export default SidePanel;
