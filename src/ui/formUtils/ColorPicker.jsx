import React from "react";
import { SketchPicker } from "react-color";
import { useTranslation } from "react-i18next";
import { parseToRgba, rgba } from "color2k";

import styled from "styled-components";

import backgroundGrid from "../../images/background-grid.png";

const Color = styled.div`
  position: relative;
  background-image: url(${backgroundGrid});
  width: 32px;
  height: 32px;
  margin: 5px;
  cursor: pointer;

  &::after {
    inset: 0;
    content: "";
    position: absolute;
    background: ${({ color }) => color};
    border: 2px solid #ffffff66;
  }
`;

const ColorPickerWrapper = styled.div`
  position: fixed;
  inset: 0;
  background-color: #151515b0;
  z-index: 290;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const ColorPicker = ({ value, onChange, disableAlpha = true }) => {
  const [showPicker, setShowPicker] = React.useState(false);
  const [currentColor, setCurrentColor] = React.useState(() => {
    if (value === "") {
      return { r: 150, g: 150, b: 150, a: 1 };
    }
    try {
      const [red, green, blue, alpha] = parseToRgba(value);
      return { r: red, g: green, b: blue, a: alpha };
    } catch (e) {
      console.log("Failed to parse color", e);
      return { r: 0, g: 0, b: 0, a: 1 };
    }
  });

  const { t } = useTranslation();

  const showColorPicker = () => {
    setShowPicker((prev) => !prev);
  };

  const handleChange = React.useCallback((newColor) => {
    setCurrentColor(newColor.rgb);
  }, []);

  const handleChangeComplete = React.useCallback(
    (newColor) => {
      setCurrentColor(newColor.rgb);
      const { r: red, g: green, b: blue, a: alpha } = newColor.rgb;
      onChange(rgba(red, green, blue, alpha));
    },
    [onChange]
  );

  const handleClick = React.useCallback(() => {
    setShowPicker(false);
  }, []);

  return (
    <>
      <Color color={value} onClick={showColorPicker} />
      {showPicker && (
        <ColorPickerWrapper>
          <SketchPicker
            color={currentColor}
            onChange={handleChange}
            disableAlpha={disableAlpha}
            onChangeComplete={handleChangeComplete}
          />
          <button onClick={handleClick}>{t("Close")}</button>
        </ColorPickerWrapper>
      )}
    </>
  );
};

export default ColorPicker;
