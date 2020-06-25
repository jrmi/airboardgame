import React from "react";
import { BlockPicker } from "react-color";

import styled from "styled-components";

const Color = styled.div`
  background-color: ${({ color }) => color};
  width: 20px;
  height: 20px;
  margin: 5px;
  cursor: ${({ editable }) => (editable ? "pointer" : "auto")};
`;

const ColorPickerWrapper = styled.div`
  position: absolute;
  top: 38px;
  left: -53px;
  z-index: 1000;
`;

const ColorPicker = ({ value, onChange }) => {
  const [showPicker, setShowPicker] = React.useState(false);

  const showColorPicker = () => {
    setShowPicker((prev) => !prev);
  };

  const handleChange = React.useCallback(
    (newColor) => {
      onChange(newColor.hex);
    },
    [onChange]
  );

  return (
    <div style={{ position: "relative" }}>
      <Color color={value} onClick={showColorPicker} />
      {showPicker && (
        <ColorPickerWrapper>
          <BlockPicker color={value} onChangeComplete={handleChange} />
        </ColorPickerWrapper>
      )}
    </div>
  );
};

export default ColorPicker;
