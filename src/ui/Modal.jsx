import React from "react";
import SidePanel from "./SidePanel";

export const Modal = ({ setShow, show, ...rest }) => {
  return (
    <SidePanel
      open={show}
      onClose={() => setShow(false)}
      position="right"
      modal
      width="33%"
      {...rest}
    />
  );
};

export default Modal;
