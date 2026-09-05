import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";

import { FiX } from "react-icons/fi";

const StyledModalWrapper = styled.div`
  position: fixed;
  inset: 0;
  justify-content: center;
  align-items: start;

  z-index: 280;
  overflow: hidden;
  overflow-y: auto;

  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);

  background-color: #00000040;

  opacity: 0;
  display: flex;

  &.modal__wrapper--open {
    opacity: 1;
  }

  .modal__close {
    position: absolute;
    top: 5px;
    right: 10px;
  }

  .modal__title {
    font-weight: 700;
    padding: 0.5em;
    margin: 0;
    padding-right: 73px;
  }

  .modal {
    background-color: var(--color-blueGrey);
    border-radius: 5px;
    position: relative;
    box-shadow: rgba(0, 0, 0, 0.5) 0px 0px 30px;
    margin: 5px;
    margin-top: 2em;
    max-width: 40%;
    min-width: 290px;
  }

  .modal__content {
    flex: 1;
    overflow: auto;
    ${({ noMargin }) => (noMargin ? "" : "padding: 1em")};
    header {
      padding: 0.5em;
      margin-top: 2em;
      background-color: var(--color-blueGrey);
      border-radius: 0.5em 0.5em 0em 0em;
      & h3 {
        margin: 0.2em 0.2em 0.2em;
        font-weight: 300;
      }
    }

    header:first-child {
      margin-top: 0;
    }

    & section {
      border-radius: 0em 0em 0.5em 0.5em;
      padding: 1em;
      background-color: var(--color-darkBlueGrey);
    }
  }

  .modal__footer {
    margin-top: 1em;
  }

  @media screen and (max-width: 1024px) {
    & .modal {
      max-width: 70%;
    }
  }

  @media screen and (max-width: 640px) {
    & .modal {
      max-width: 100%;
    }
  }
`;

const Modal = ({
  children,
  title,
  footer,
  show,
  setShow = () => {},
  onClose,
  canClose = true,
  noMargin = false,
}) => {
  const modalRef = React.useRef();
  const mouseDownOnOverlayRef = React.useRef(false);
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
    // Re-derive from `show` on every change, not just from "closed"/"open" —
    // otherwise toggling show again while still mid-transition (e.g. close
    // then quickly reopen) leaves state stuck in "closing"/"opening" forever,
    // since neither branch below would ever match it again.
    setState((prev) => {
      if (show) return prev === "open" ? "open" : "opening";
      return prev === "closed" ? "closed" : "closing";
    });
  }, [show]);

  React.useEffect(() => {
    if (show) {
      document.getElementById("root").classList.add("blurry");
    } else {
      document.getElementById("root").classList.remove("blurry");
    }
  }, [show]);

  const bindTo = document.getElementById("modal-container");

  if (!bindTo || (state === "closed" && !show)) {
    return null;
  }

  const close = () => {
    if (!canClose) return;
    onClose?.();
    setShow(false);
  };

  // Dragging to select text (e.g. selecting all of the username) can start
  // inside the modal content and overshoot the modal edge before releasing
  // the mouse button on the backdrop — the resulting click's target is then
  // the overlay itself, indistinguishable from an intentional click-outside
  // unless we also check where the drag started.
  const onOverlayMouseDown = (event) => {
    mouseDownOnOverlayRef.current = event.target === modalRef.current;
  };

  const onOverlayClick = (event) => {
    if (event.target === modalRef.current && mouseDownOnOverlayRef.current) {
      close();
    }
    mouseDownOnOverlayRef.current = false;
  };

  return createPortal(
    <StyledModalWrapper
      ref={modalRef}
      onTransitionEnd={onAnimationEnd}
      onMouseDown={onOverlayMouseDown}
      onClick={onOverlayClick}
      noMargin={noMargin}
      className={
        state === "opening" || state === "open" ? "modal__wrapper--open" : ""
      }
    >
      <div className="modal">
        <header className="modal__header">
          {title && <h2 className="modal__title">{title}</h2>}
          <button
            className="button clear icon-only modal__close"
            onClick={close}
          >
            <FiX size={42} alt={t("Close")} color="white" />
          </button>
        </header>
        <div className="modal__content">{open && children}</div>
        {footer && <footer className="modal__footer">{footer}</footer>}
      </div>
    </StyledModalWrapper>,
    bindTo
  );
};

export default Modal;
