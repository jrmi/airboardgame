import React from "react";

export const Modal = ({ setShow, show, children, footer, title }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="modal">
      <input id="modal_1" type="checkbox" checked={show} readOnly />
      <div
        className="overlay"
        onClick={() => {
          setShow(false);
        }}
      ></div>
      <article>
        <header>
          <h3>{title}</h3>
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
  );
};

export default Modal;
