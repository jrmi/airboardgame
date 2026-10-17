import React from "react";
import styled from "styled-components";

export const MenuRoot = styled.div.attrs({ className: "top-menu" })`
  position: relative;
  height: 100%;

  @media screen and (min-width: 641px) {
    &:hover .top-menu__trigger {
      background: ${({ $dismissed }) =>
        $dismissed ? "transparent" : "rgba(255, 255, 255, 0.1)"};
    }

    &:hover .top-menu__panel {
      display: ${({ $dismissed }) => ($dismissed ? "none" : "block")} !important;
    }
  }
`;

export const MenuTrigger = styled.button.attrs({
  className: "top-menu__trigger",
})`
  display: inline-flex;
  align-items: center;
  gap: 0.45em;
  position: relative;
  height: 100%;
  padding: 0 0.75em;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;

  &:hover,
  &[aria-expanded="true"] {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const MenuBadge = styled.span`
  display: grid;
  min-width: 1.25em;
  height: 1.25em;
  padding: 0 0.2em;
  margin-left: 0.1em;
  place-items: center;
  border-radius: 1em;
  background: var(--color-success);
  color: var(--color-primary-foreground);
  font-size: 0.7em;
  font-weight: 700;
`;

const MenuPanel = styled.div.attrs({ className: "top-menu__panel" })`
  position: absolute;
  top: calc(100% + 1px);
  left: 0;
  min-width: 12em;
  padding: 0.35em;
  background: var(--color-board-panel-raised);
  border: 1px solid var(--color-board-border);
  border-radius: 0 0 6px 6px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.38);
  display: ${({ $open }) => ($open ? "block" : "none")};
`;

export const MenuItem = styled.button.attrs(({ $keepMenuOpen }) => ({
  "data-close-mobile-menu": $keepMenuOpen ? undefined : true,
  "data-menu-item": true,
}))`
  display: flex;
  align-items: center;
  gap: 0.65em;
  width: 100%;
  padding: 0.55em 0.75em;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

export const TopMenu = ({
  Icon,
  label,
  badge,
  activeMenu,
  setActiveMenu,
  children,
}) => {
  const open = activeMenu === label;
  const [dismissed, setDismissed] = React.useState(false);

  return (
    <MenuRoot
      $dismissed={dismissed}
      onMouseEnter={(event) => {
        if (!event.currentTarget.contains(event.target)) return;
        setDismissed(false);
        setActiveMenu(label);
      }}
      onMouseLeave={(event) => {
        if (!event.currentTarget.contains(event.target)) return;
        setDismissed(false);
        setActiveMenu(null);
      }}
      onClickCapture={(event) => {
        if (event.target.closest("[data-menu-item]")) {
          setDismissed(true);
          setActiveMenu(null);
        }
      }}
    >
      <MenuTrigger
        type="button"
        aria-expanded={open}
        onClick={() => {
          setDismissed(false);
          setActiveMenu(open ? null : label);
        }}
      >
        {Icon && <Icon size={16} aria-hidden="true" />}
        {label}
        {badge !== undefined && <MenuBadge>{badge}</MenuBadge>}
      </MenuTrigger>
      <MenuPanel $open={open}>{children}</MenuPanel>
    </MenuRoot>
  );
};
