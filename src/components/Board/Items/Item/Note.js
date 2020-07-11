import React, { memo } from "react";
import styled, { css } from "styled-components";

const NotePane = styled.div`
  ${({ color, fontSize, textColor }) => css`
    background-color: ${color};
    width: 14em;
    padding: 0.5em;
    text-align: center;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    box-shadow: 5px 5px 7px rgba(33, 33, 33, 0.7);
    color: ${textColor};

    & h2 {
      font-weight: bold;
      padding: 0.2em 0;
    }
    & textarea {
      font-family: "Gloria Hallelujah", cursive;
      width: 100%;
      height: 8em;
      padding: 0.2em 0;
      background-color: transparent;
      resize: none;
      border: none;
      font-size: ${fontSize}px;
    }
  `}
`;

const Note = ({
  value = "",
  color = "#ffc",
  label = "",
  textColor = "#000",
  fontSize = "20",
  setState,
}) => {
  const setValue = (e) => {
    setState((prevState) => ({
      ...prevState,
      value: e.target.value,
    }));
  };

  return (
    <NotePane color={color} fontSize={fontSize} textColor={textColor}>
      <label style={{ userSelect: "none" }}>
        <h2>{label}</h2>
        <textarea value={value} onChange={setValue} />
      </label>
    </NotePane>
  );
};

export default memo(Note);
