import React, { memo } from "react";
import styled, { css } from "styled-components";

const NotePane = styled.div`
  ${({ color, fontSize }) => css`
    background-color: ${color};
    width: 12em;
    padding: 0.5em;
    padding-bottom: 2em;
    text-align: center;
    fontsize: ${fontSize}px;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    box-shadow: 10px 10px 13px 0px rgb(0, 0, 0, 0.3);
  `}
`;

const Note = ({
  value = "",
  color = "#CCC",
  label = "",
  textColor = "#000",
  fontSize = "16",
  setState,
}) => {
  const setValue = (e) => {
    setState((prevState) => ({
      ...prevState,
      value: e.target.value,
    }));
  };

  return (
    <NotePane color={color} fontSize={fontSize}>
      <label style={{ userSelect: "none" }}>
        {label}
        <textarea
          style={{
            textColor,
            width: "100%",
            display: "block",
            border: "1px solid #00000020",
            height: "8em",
            margin: "0.2em 0",
            padding: "0.2em 0",
            fontSize: fontSize + "px",
            backgroundColor: "transparent",
            resize: "none",
          }}
          value={value}
          onChange={setValue}
        />
      </label>
    </NotePane>
  );
};

export default memo(Note);
