import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

const StyledSidePanel = styled.div`
  position: fixed;
  z-index: 10;
  ${({ position }) => (position === "right" ? "right: 0;" : "left: 0;")}
  top: 4em;
  bottom: 0em;

  background-color: var(--color-blueGrey);

  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  width: 25%;
  min-width: 280px;
  overflow-y: scroll;
  & .close {
    position: absolute;
    top: 5px;
    right: 10px;
  }
  transform: translateX(100%);
  transition: all 500ms cubic-bezier(0.4, 0, 0.2, 1);
  padding: 1em;

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

const SidePanel = ({ children, position, onClose = () => {} }) => {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(true);
  }, []);

  const onCloseHandler = React.useCallback(() => {
    setOpen(false);
  }, []);

  const onAnimationEnd = React.useCallback(() => {
    if (!open) {
      onClose();
    }
  }, [onClose, open]);

  return (
    <StyledSidePanel
      position={position}
      open={open}
      onTransitionEnd={onAnimationEnd}
    >
      <button className="button clear icon-only close" onClick={onCloseHandler}>
        <img
          src="https://icongr.am/feather/x.svg?size=30&color=ffffff"
          alt={t("Close")}
        />
      </button>
      {children}
    </StyledSidePanel>
  );
};

export default SidePanel;
