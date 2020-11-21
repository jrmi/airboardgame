import React from "react";
import { useTranslation } from "react-i18next";

import styled from "styled-components";

import { hasClass } from "../utils";

const StyledModal = styled.div.attrs(() => ({ className: "overlay" }))`
  position: fixed;
  z-index: 20;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 5px;
  .modal-content {
    max-width: 50%;
    position: relative;
    margin: 10% auto;
    padding: 8px 8px 8px 8px;
    border-radius: 2px;
    background: var(--bg-secondary-color);
    box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px,
      rgba(0, 0, 0, 0.23) 0px 6px 6px;
  }
  .close {
    position: absolute;
    top: 0.2em;
    right: 0.2em;
    padding: 0.5rem;
    margin: 0;
  }
  footer {
    margin-top: 1em;
  }

  @media screen and (max-width: 640px) {
    & .modal-content {
      max-width: 90%;
    }
  }
`;

export const Modal = ({ setShow, show, children, footer, title }) => {
  const { t } = useTranslation();

  if (!show) {
    return null;
  }

  return (
    <StyledModal
      onClick={(e) => {
        if (hasClass(e.target, "overlay")) setShow(false);
      }}
    >
      <div className="modal-content">
        <article>
          <header>
            <h3 className="title">{title}</h3>
            <button
              className="button clear icon-only close"
              onClick={() => {
                setShow(false);
              }}
            >
              <img
                src="https://icongr.am/feather/x.svg?size=30&color=ffffff"
                alt={t("Close")}
              />
            </button>
          </header>
          <section className="content">{children}</section>
          <footer>{footer}</footer>
        </article>
      </div>
    </StyledModal>
  );
};

export default Modal;
