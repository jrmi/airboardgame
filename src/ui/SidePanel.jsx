import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import usePortal from "react-useportal";

const StyledSidePanel = styled.div`
  position: fixed;
  ${({ position }) => (position === "right" ? "right: 0;" : "left: 0;")}
  top: 0;
  bottom: 0em;
  z-index: 22;

  background-color: var(--color-blueGrey);

  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  width: 25%;
  min-width: 280px;
  overflow-y: auto;
  & .close {
    position: fixed;
    top: 5px;
    right: 10px;
  }
  transform: translateX(100%);
  transition: all 500ms cubic-bezier(0.4, 0, 0.2, 1);
  ${({ noMargin }) => (noMargin ? "" : "padding: 1em")};

  ${({ open, position }) => {
    let start = -100;
    let end = 0;
    if (position === "right") {
      start = 100;
    }
    return open
      ? `transform: translateX(${end}%);`
      : `transform: translateX(${start}%);`;
  }}

  ${({ open }) => (open ? "opacity: 1;" : "opacity: 0.2;")}
`;

const SidePanel = ({
  children,
  position,
  noMargin,
  onClose = () => {},
  open,
}) => {
  const { t } = useTranslation();
  const { ref, Portal, openPortal, closePortal, isOpen } = usePortal({
    closeOnOutsideClick: false,
  });

  const onAnimationEnd = React.useCallback(() => {
    if (!isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  React.useEffect(() => {
    if (open) {
      openPortal();
    } else {
      closePortal();
    }
  }, [openPortal, closePortal, open]);

  return (
    <>
      <Portal>
        <StyledSidePanel
          position={position}
          open={isOpen}
          onTransitionEnd={onAnimationEnd}
          noMargin={noMargin}
          ref={ref}
        >
          <button
            className="button clear icon-only close"
            onClick={closePortal}
          >
            <img
              src="https://icongr.am/feather/x.svg?size=42&color=ffffff"
              alt={t("Close")}
            />
          </button>
          {children}
        </StyledSidePanel>
      </Portal>
    </>
  );
};

export default SidePanel;
