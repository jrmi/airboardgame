import React, { memo, useEffect } from "react";
import styled, { css } from "styled-components";

const NotePane = styled.div`
  ${({ color, fontSize, textColor, width, height }) => css`
    background-color: ${color};
    width: ${width}px;
    padding: 0.5em;
    text-align: center;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    box-shadow: 5px 5px 7px rgba(33, 33, 33, 0.7);
    color: ${textColor};

    & h3 {
      font-weight: bold;
      padding: 0.2em 0;
      margin: 0;
    }
    & textarea {
      height: ${height}px;
      font-family: "Gloria Hallelujah", cursive;
      width: 100%;
      padding: 0.2em 0;
      background-color: transparent;
      resize: none;
      border: 1px solid #00000011;
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
  width = 300,
  height = 200,
  setState,
}) => {
  // To avoid this behaviour https://github.com/facebook/react/issues/955
  // We have a local state and a use effect when incoming update occurs
  const [currentValue, setCurrentValue] = React.useState(value);

  const setValue = (e) => {
    const value = e.target.value;
    setCurrentValue(value);
    setState((prevState) => ({
      ...prevState,
      value,
    }));
  };

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  return (
    <NotePane
      color={color}
      fontSize={fontSize}
      textColor={textColor}
      width={width}
      height={height}
    >
      <label style={{ userSelect: "none" }}>
        <h3>{label}</h3>
        <textarea value={currentValue} onChange={setValue} />
      </label>
    </NotePane>
  );
};

export default memo(Note);
