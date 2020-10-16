import React from "react";

import styled from "styled-components";

const StyledModal = styled.div`
  position: fixed;
  z-index: 20;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(0, 0, 0);
  background-color: rgba(0, 0, 0, 0.4);
  .modal-content {
    max-width: 50%;
    position: relative;
    margin: 10% auto;
    padding: 8px 8px 8px 8px;
    border-radius: 2px;
    background: var(--bg-secondary-color);
  }
  .close {
    position: absolute;
    top: 0.5em;
    right: 0.5em;
  }
`;

export const Modal = ({ setShow, show, children, footer, title }) => {
  if (!show) {
    return null;
  }

  return (
    <StyledModal
      onClick={() => {
        setShow(false);
      }}
    >
      <div className="modal-content">
        <div
          className="overlay"
          onClick={() => {
            setShow(false);
          }}
        ></div>
        <article>
          <header>
            <h3 className="title">{title}</h3>
            <button
              onClick={() => {
                setShow(false);
              }}
              className="close"
            >
              &times;
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
