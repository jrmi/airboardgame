import React from "react";

import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  background-color: #202b38;
  color: #606984;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Waiter = ({ message }) => {
  return (
    <Overlay>
      <div>{message}</div>
    </Overlay>
  );
};

export default Waiter;
