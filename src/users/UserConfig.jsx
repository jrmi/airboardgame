import React from "react";
import { SketchPicker } from "react-color";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import Modal from "../ui/Modal";

import UserCircle from "./UserCircle";
import useHiddenItemOpacity from "../hooks/useHiddenItemOpacity";

const StyledInputName = styled.input`
  &:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="color"]):not([type="button"]):not([type="reset"]) {
    width: 12em;
  }
`;

const ErrorText = styled.div`
  color: #e53935;
  font-size: 0.85em;
`;

const emptyStyle = {};
const emptyColors = [];
const emptyNames = [];

const UserConfig = ({
  user,
  updateCurrentUser,
  editable,
  index,
  existingNames = emptyNames,
}) => {
  const { t } = useTranslation();

  const [hiddenItemOpacity, setHiddenItemOpacity] = useHiddenItemOpacity();

  const [name, setName] = React.useState(user.name);
  const [color, setColor] = React.useState(user.color);
  const [showDetails, setShowDetails] = React.useState(false);
  const [nameTaken, setNameTaken] = React.useState(false);

  const isNameTaken = React.useCallback(
    (value) => {
      const trimmed = value.trim().toLowerCase();
      return (
        trimmed !== "" &&
        existingNames.some((n) => (n || "").trim().toLowerCase() === trimmed)
      );
    },
    [existingNames]
  );

  // Mirrors the color picker below: onChange only updates the local preview
  // (and live validation feedback), onBlur commits the broadcast — so a
  // name that ends up colliding mid-typing (e.g. "paul" typed one letter at
  // a time while someone else already has it) never gets partially
  // broadcast as a stray fragment like "pau".
  const handleChange = React.useCallback(
    (e) => {
      const newName = e.target.value;
      setName(newName);
      setNameTaken(isNameTaken(newName));
    },
    [isNameTaken]
  );

  const commitName = React.useCallback(() => {
    const trimmed = name.trim();
    if (trimmed === "" || isNameTaken(trimmed)) {
      setNameTaken(trimmed !== "");
      return false;
    }
    setNameTaken(false);
    if (trimmed !== user.name) {
      updateCurrentUser({ name: trimmed });
    }
    return true;
  }, [name, user.name, isNameTaken, updateCurrentUser]);

  const handleSave = React.useCallback(() => {
    if (commitName()) {
      setShowDetails(false);
    }
  }, [commitName]);

  const handleClose = React.useCallback(() => {
    // Discard any name typed but not saved, so reopening doesn't show a
    // half-edited value the user explicitly chose not to keep.
    setName(user.name);
    setNameTaken(false);
    setShowDetails(false);
  }, [user.name]);

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
      <Modal
        title={t("User details")}
        show={showDetails}
        setShow={setShowDetails}
        onClose={handleClose}
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
          onKeyDown={(e) => {
            // Committing only on Enter/Save (not on blur) so clicking Close
            // right after typing reliably discards instead of racing a
            // blur-triggered commit that fires before the click handler.
            if (e.key === "Enter") {
              commitName();
            }
          }}
        />
        {nameTaken && <ErrorText>{t("This name is already taken")}</ErrorText>}

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

        {editable && (
          <>
            <label>
              {t("Hidden item opacity")} ({Math.round(hiddenItemOpacity * 100)}
              %)
            </label>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={hiddenItemOpacity}
              onChange={(e) => setHiddenItemOpacity(parseFloat(e.target.value))}
            />
          </>
        )}
      </Modal>
    </>
  );
};

export default UserConfig;
