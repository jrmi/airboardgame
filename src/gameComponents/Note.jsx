import React, { memo, useEffect } from "react";
import styled, { css } from "styled-components";

const NotePane = styled.div`
  ${({ color, fontSize, textColor, width, height, fontFamily }) => css`
    background-color: ${color};
    width: ${width}px;
    padding: 0.5em;
    text-align: center;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    box-shadow: 5px 5px 7px rgba(33, 33, 33, 0.7);
    color: ${textColor};

    .item-library__component & {
      background-color: #ccc;
    }

    & .note__title {
      min-height: 2em;
      font-family: "${fontFamily}", sans-serif;
      font-weight: bold;
      padding: 0.2em 0;
      margin: 0;

      .item-library__component & {
        min-height: auto;
      }
    }

    & .note__textarea {
      color: ${textColor};
      font-family: "${fontFamily}", sans-serif;

      &:focus{
        outline: none;
        box-shadow: none;
        border: 1px solid #00000033;
      }

      height: ${height}px;
      width: 100%;
      padding: 0.3em;
      background-color: transparent;
      resize: none;
      border: 1px solid #00000005;
      font-size: ${fontSize}px;
      border-radius: 1px;

      .item-library__component & {
        height: 35px;
      }
    }
  `}
`;

const stopPropagationIfActive = (e) =>
  e.target === document.activeElement && e.stopPropagation();

const Note = ({
  value = "",
  color = "#ffc",
  label = "",
  textColor = "#000",
  fontFamily = "Roboto",
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
      fontFamily={fontFamily}
      width={width}
      height={height}
      onKeyDown={stopPropagationIfActive}
      onKeyUp={stopPropagationIfActive}
      onWheel={stopPropagationIfActive}
      onPointerMove={stopPropagationIfActive}
    >
      <label style={{ userSelect: "none" }}>
        <h3 className="note__title">{label}</h3>
        <textarea
          className="note__textarea"
          value={currentValue}
          onChange={setValue}
        />
      </label>
    </NotePane>
  );
};

export default memo(Note);
