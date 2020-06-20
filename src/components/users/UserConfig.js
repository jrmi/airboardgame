import React from "react";
import { BlockPicker } from "react-color";

import styled from "styled-components";

const UserColor = styled.div`
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

const StyledInputName = styled.input`
  border: none;
  padding: 2px;
  padding-left: 0.5em;
  background-color: #ccc;
  width: 7em;
`;

const StyledName = styled.span`
  line-height: 30px;
  padding-left: 0.5em;
`;

const UserConfig = ({ user, setUser, editable }) => {
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
      />
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
