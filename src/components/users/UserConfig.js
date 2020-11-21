import React from "react";
import { SketchPicker } from "react-color";

import styled from "styled-components";

import Modal from "../../ui/Modal";

const UserColor = styled.div`
  background-color: ${({ color }) => color};
  width: 30px;
  height: 30px;
  margin: 2px;
  margin-right: 0.5em;
  border-radius: 100%;
  text-align: center;
  line-height: 30px;
  cursor: ${({ editable }) => (editable ? "pointer" : "default")};

  @media screen and (max-width: 640px) {
    & {
      font-size: 0.5em;
      width: 20px;
      height: 20px;
      line-height: 20px;
    }
  }
`;

const StyledInputName = styled.input`
  &:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="color"]):not([type="button"]):not([type="reset"]) {
    width: 10em;
  }
`;

const emptyStyle = {};
const emptyColors = [];

const UserConfig = ({ user, setUser, editable, index }) => {
  const [name, setName] = React.useState(user.name);
  const [color, setColor] = React.useState(user.color);
  const [showDetails, setShowDetails] = React.useState(false);

  const handleChange = React.useCallback(
    (e) => {
      setName(e.target.value);
      setUser((prevUser) => ({ ...prevUser, name: e.target.value }));
    },
    [setUser]
  );

  const handleChangecolor = React.useCallback((newColor) => {
    setColor(newColor.hex);
  }, []);

  const handleChangecolorComplete = React.useCallback(
    (newColor) => {
      setColor(newColor.hex);
      setUser((prevUser) => ({ ...prevUser, color: newColor.hex }));
    },
    [setUser]
  );

  return (
    <>
      <UserColor
        color={user.color}
        editable={editable}
        onClick={() => editable && setShowDetails(true)}
        title={user.name}
      >
        {user.name ? user.name[0] : index}
        {editable ? "*" : ""}
      </UserColor>
      <Modal title={"User details"} show={showDetails} setShow={setShowDetails}>
        <label>Username</label>
        <StyledInputName value={name} onChange={handleChange} />

        <label>Color</label>
        <SketchPicker
          disableAlpha
          presetColors={emptyColors}
          color={color}
          onChange={handleChangecolor}
          onChangeComplete={handleChangecolorComplete}
          styles={emptyStyle}
          width={160}
        />
      </Modal>
    </>
  );
};

export default UserConfig;
