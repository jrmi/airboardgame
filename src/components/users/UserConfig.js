import React from "react";
import { BlockPicker } from "react-color";

import styled from "styled-components";

const UserColor = styled.div`
  background-color: ${({ color }) => color};
  width: 30px;
  height: 30px;
  margin: 2px;
  margin-right: 0.5em;
  text-align: center;
  line-height: 30px;
  cursor: ${({ editable }) => (editable ? "pointer" : "auto")};
`;

const ColorPickerWrapper = styled.div`
  position: absolute;
  top: 45px;
  left: -68px;
  z-index: 1000;
`;

const StyledInputName = styled.input.attrs(() => ({ className: "uk-input" }))`
  width: 7em;
`;

const StyledName = styled.span`
  padding-left: 0.5em;
`;

const UserConfig = ({ user, setUser, editable, index }) => {
  const [name, setName] = React.useState(user.name);
  const [showPicker, setShowPicker] = React.useState(false);

  const handleChange = (e) => {
    setName(e.target.value);
    setUser({ ...user, name: e.target.value });
  };

  const handleChangecolor = (newColor) => {
    setUser({ ...user, color: newColor.hex });
    setShowPicker(false);
  };

  const showColorPicker = () => {
    if (editable) {
      setShowPicker((prev) => !prev);
    }
  };

  return (
    <>
      <UserColor
        color={user.color}
        editable={editable}
        onClick={showColorPicker}
      >
        {index}
      </UserColor>
      {showPicker && (
        <ColorPickerWrapper>
          <BlockPicker
            color={user.color}
            onChangeComplete={handleChangecolor}
          />
        </ColorPickerWrapper>
      )}
      {editable && <StyledInputName value={name} onChange={handleChange} />}
      {!editable && <StyledName>{user.name}</StyledName>}
    </>
  );
};

export default UserConfig;
