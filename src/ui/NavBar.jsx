import React from "react";
import styled from "styled-components";
import { useMediaQuery } from "@react-hookz/web";

import { FiChevronsDown, FiChevronsUp, FiMenu, FiX } from "react-icons/fi";
import { useTranslation } from "react-i18next";

import NavButton from "./NavButton";

const StyledNavBar = styled.div`
  position: fixed;
  top: 0;
  z-index: 205;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  padding: 5px 0;
  width: 40px;
  z-index: 215;
  line-height: normal;

  background-color: rgba(32, 43, 59, 0.96);
  box-shadow: 0 0 16px rgba(0, 0, 0, 0.26);

  &.nav-bar--full-height {
    height: 100%;
  }

  &.nav-bar--folded {
    height: auto;
    border-bottom: 1px solid var(--color-board-border);

    & .spacer {
      display: none;
    }

    & .sep {
      display: none;
    }

    & > :not(.keep-folded) {
      display: none;
    }
  }

  &.nav-bar--left {
    left: 0;
    border-right: 1px solid var(--color-board-border);
  }

  &.nav-bar--right {
    right: 0;
    border-left: 1px solid var(--color-board-border);
  }

  &.nav-bar--top {
    left: 0;
    right: 0;
    flex-direction: row;
    width: auto;
    height: 40px;
    padding: 0 5px;
    border-bottom: 1px solid var(--color-board-border);

    & .sep {
      width: 1px;
      height: 65%;
      margin: 0 5px;
      background-color: var(--color-grey);
    }

    & .nav-bar__close-button {
      margin: 0 0 0 auto;
      border: 0;
    }

    & .nav-bar__menu-button {
      display: none;
    }

    & > .keep-folded {
      height: 100%;
    }
  }

  .blurry & {
    filter: blur(2px) grayscale(50%);
  }

  color: var(--font-color);

  & .spacer {
    flex: 1;
  }

  & .nav-bar__content {
    display: contents;
  }

  & .sep {
    height: 1.5em;
    width: 80%;
  }

  & .nav-bar__toggle-button {
    margin-top: 10px;
    border-top: 1px solid var(--color-grey);
  }

  @media screen and (max-width: 640px) {
    &.nav-bar--top .nav-bar__menu-button {
      display: flex;
      height: 40px;
    }

    &.nav-bar--top:not(.nav-bar--folded) {
      align-items: stretch;
      flex-direction: column;
      width: 100%;
      height: 100vh;
      height: 100dvh;
      min-height: 40px;
      max-height: 100vh;
      max-height: 100dvh;
      overflow: hidden;
      padding: 0 5px;
      background: transparent;
      border-bottom: 0;
      box-shadow: none;

      &::before {
        content: "";
        position: absolute;
        top: 0;
        right: 0;
        left: 0;
        height: 40px;
        background-color: rgba(32, 43, 59, 0.96);
        border-bottom: 1px solid var(--color-board-border);
        box-shadow: 0 0 16px rgba(0, 0, 0, 0.26);
        pointer-events: none;
        z-index: 0;
      }

      & > :not(.nav-bar__close-button) {
        position: relative;
        z-index: 1;
      }

      & .spacer {
        display: none;
      }

      & .nav-bar__content {
        display: block;
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        overscroll-behavior: contain;
      }

      & > .keep-folded {
        height: auto;
      }

      & .top-menu,
      & .top-menu__help {
        width: min(20rem, 100%);
        height: auto;
        background-color: rgba(32, 43, 59, 0.96);
      }

      & .top-menu {
        border-bottom: 1px solid var(--color-board-border);
      }

      & .top-menu__trigger {
        justify-content: flex-start;
        width: 100%;
        height: 40px;
        cursor: default;
        pointer-events: none;
      }

      & .top-menu__help .top-menu__trigger {
        cursor: pointer;
        pointer-events: auto;
      }

      & .top-menu__trigger:hover,
      & .top-menu__trigger[aria-expanded="true"] {
        background: transparent;
      }

      & .top-menu__help .top-menu__trigger:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      & .top-menu__panel {
        position: static;
        width: auto;
        display: block !important;
        min-width: 0;
        padding: 0.25em 0;
        border-right: 0;
        border-left: 0;
        border-radius: 0;
        box-shadow: none;
      }

      & .nav-bar__close-button {
        position: absolute;
        top: 0;
        right: 5px;
        z-index: 1;
      }
    }
  }
`;

const NavBar = ({
  fullHeight = true,
  position = "left",
  children,
  onClose,
}) => {
  const { t } = useTranslation();
  const isSmallDevice = useMediaQuery("only screen and (max-width : 640px)");

  const [folded, setFolded] = React.useState(isSmallDevice);

  React.useEffect(() => {
    setFolded(isSmallDevice);
  }, [isSmallDevice]);

  const classes = ["nav-bar"];
  if (fullHeight) {
    classes.push("nav-bar--full-height");
  }
  if (folded) {
    classes.push("nav-bar--folded");
  }
  if (position === "top") {
    classes.push("nav-bar--top");
  } else if (position === "right") {
    classes.push("nav-bar--right");
  } else {
    classes.push("nav-bar--left");
  }
  return (
    <StyledNavBar
      className={classes.join(" ")}
      onClickCapture={(event) => {
        if (
          position === "top" &&
          isSmallDevice &&
          !folded &&
          event.target.closest("[data-close-mobile-menu]")
        ) {
          setFolded(true);
        }
      }}
    >
      {position === "top" && (
        <div className="keep-folded nav-bar__menu-button">
          <NavButton
            onClick={() => setFolded((prev) => !prev)}
            alt={t("Fold/Unfold")}
            title={t("Fold/Unfold")}
            Icon={FiMenu}
          />
        </div>
      )}
      {position === "top" ? (
        <div className="nav-bar__content">{children}</div>
      ) : (
        children
      )}
      {position === "top" && onClose ? (
        <div className="keep-folded nav-bar__close-button">
          <NavButton
            onClick={() => {
              if (isSmallDevice && !folded) {
                setFolded(true);
                return;
              }
              onClose();
            }}
            alt={isSmallDevice && !folded ? t("Close") : t("Quit")}
            title={isSmallDevice && !folded ? t("Close") : t("Quit")}
            Icon={FiX}
          />
        </div>
      ) : (
        <div className="keep-folded nav-bar__toggle-button">
          <NavButton
            onClick={() => setFolded((prev) => !prev)}
            alt={t("Fold/Unfold")}
            title={t("Fold/Unfold")}
            Icon={folded ? FiChevronsDown : FiChevronsUp}
          />
        </div>
      )}
    </StyledNavBar>
  );
};

export default NavBar;
