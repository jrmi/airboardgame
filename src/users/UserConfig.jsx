import React from "react";
import { SketchPicker } from "react-color";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import Modal from "../ui/Modal";

import UserCircle from "./UserCircle";

const StyledInputName = styled.input`
  &:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not(
      [type="color"]
    ):not([type="button"]):not([type="reset"]) {
    width: 12em;
  }
`;

const UserNameButton = styled.button`
  overflow: hidden;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};
  font: inherit;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const emptyStyle = {};
const emptyColors = [];

const UserConfig = ({
  user,
  updateCurrentUser,
  editable,
  index,
  showName,
  groups,
  assignedGroup,
  onAssignGroup,
}) => {
  const { t } = useTranslation();

  const [name, setName] = React.useState(user.name);
  const [color, setColor] = React.useState(user.color);
  const [showDetails, setShowDetails] = React.useState(false);
  const canOpenDetails = editable || Boolean(onAssignGroup);

  const handleChange = React.useCallback(
    (e) => {
      setName(e.target.value);
      updateCurrentUser({ name: e.target.value });
    },
    [updateCurrentUser]
  );

  const handleChangecolor = React.useCallback((newColor) => {
    setColor(newColor.hex);
  }, []);

  const handleChangecolorComplete = React.useCallback(
    (newColor) => {
      setColor(newColor.hex);
      updateCurrentUser({ color: newColor.hex });
    },
    [updateCurrentUser]
  );

  return (
    <>
      <UserCircle
        color={user.color}
        onClick={() => canOpenDetails && setShowDetails(true)}
        title={user.name}
        name={user.name || `${index}`}
        isSelf={editable}
      />
      {showName && (
        <UserNameButton
          disabled={!canOpenDetails}
          onClick={() => canOpenDetails && setShowDetails(true)}
        >
          {user.name || `${index}`}
        </UserNameButton>
      )}
      <Modal
        title={t("User details")}
        show={showDetails}
        setShow={setShowDetails}
      >
        {editable && (
          <>
            <label>{t("Username")}</label>
            <StyledInputName value={name} onChange={handleChange} />

            <label>{t("Color")}</label>
            <SketchPicker
              disableAlpha
              presetColors={emptyColors}
              color={color}
              onChange={handleChangecolor}
              onChangeComplete={handleChangecolorComplete}
              styles={emptyStyle}
              width={160}
            />
          </>
        )}
        {onAssignGroup && (
          <label>
            {t("Camp for {{name}}", { name: user.name })}
            <select
              aria-label={t("Camp for {{name}}", { name: user.name })}
              value={assignedGroup}
              onChange={(event) => onAssignGroup(event.target.value)}
            >
              {groups.map(({ id, name }) => (
                <option key={id} value={id}>
                  {id === "players" ? t("Unassigned") : name}
                </option>
              ))}
            </select>
          </label>
        )}
      </Modal>
    </>
  );
};

export default UserConfig;
