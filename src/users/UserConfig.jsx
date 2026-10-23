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
  existingNames = [],
}) => {
  const { t } = useTranslation();

  const [name, setName] = React.useState(user.name);
  const [color, setColor] = React.useState(user.color);
  const [showDetails, setShowDetails] = React.useState(false);
  const [nameTaken, setNameTaken] = React.useState(false);

  React.useEffect(() => {
    if (!showDetails) {
      setName(user.name);
    }
  }, [showDetails, user.name]);

  const isNameTaken = React.useCallback(
    (value) => {
      const normalizedName = (value || "").trim().toLowerCase();
      return (
        normalizedName !== "" &&
        existingNames.some(
          (existingName) =>
            (existingName || "").trim().toLowerCase() === normalizedName
        )
      );
    },
    [existingNames]
  );

  const handleChange = React.useCallback(
    (e) => {
      setName(e.target.value);
      setNameTaken(isNameTaken(e.target.value));
    },
    [isNameTaken]
  );

  const handleClose = React.useCallback(() => {
    setName(user.name);
    setNameTaken(false);
    setShowDetails(false);
  }, [user.name]);

  const commitName = React.useCallback(() => {
    const trimmedName = name.trim();
    const taken = isNameTaken(trimmedName);
    setNameTaken(taken);
    if (!trimmedName || taken) {
      return false;
    }
    if (trimmedName !== user.name) {
      updateCurrentUser({ name: trimmedName });
    }
    return true;
  }, [isNameTaken, name, updateCurrentUser, user.name]);

  const handleSave = React.useCallback(() => {
    if (commitName()) {
      setShowDetails(false);
    }
  }, [commitName]);

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
        onClick={() => editable && setShowDetails(true)}
        title={user.name}
        name={user.name || `${index}`}
        isSelf={editable}
      />
      {showName && (
        <UserNameButton
          disabled={!editable}
          onClick={() => editable && setShowDetails(true)}
        >
          {user.name || `${index}`}
        </UserNameButton>
      )}
      <Modal
        title={t("User details")}
        show={showDetails}
        setShow={(show) => (show ? setShowDetails(true) : handleClose())}
        footer={
          <div style={{ display: "flex", justifyContent: "end", gap: "0.5em" }}>
            <button onClick={handleClose} className="button">
              {t("Close")}
            </button>
            <button onClick={handleSave} className="button">
              {t("Save")}
            </button>
          </div>
        }
      >
        <label>{t("Username")}</label>
        <StyledInputName
          value={name}
          onChange={handleChange}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              commitName();
            }
          }}
        />
        {nameTaken && (
          <div style={{ color: "#e53935" }}>
            {t("This name is already taken")}
          </div>
        )}

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
      </Modal>
    </>
  );
};

export default UserConfig;
