import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import Modal from "../ui/Modal";
import ColorPicker from "../ui/formUtils/ColorPicker";

import UserCircle from "./UserCircle";

const StyledInputName = styled.input`
  &:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not(
      [type="color"]
    ):not([type="button"]):not([type="reset"]) {
    width: 100%;
  }
`;

const UserDetailsFields = styled.div`
  display: grid;
  gap: 0.9rem;

  > label {
    display: block;
    margin-bottom: 0.3rem;

    input {
      display: block;
      margin-top: 0.3rem;
    }
  }
`;

const ColorField = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TeamAssignment = styled.label`
  display: block;
  border-top: 1px solid var(--color-border);
  margin-top: 1rem;
  padding-top: 1rem;

  select {
    box-sizing: border-box;
    width: 100%;
    margin-top: 0.3rem;
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

const UserConfig = ({
  user,
  updateCurrentUser,
  editable,
  index,
  showName,
  teams,
  assignedTeam,
  onAssignTeam,
}) => {
  const { t } = useTranslation();

  const [name, setName] = React.useState(user.name);
  const [color, setColor] = React.useState(user.color);
  const [showDetails, setShowDetails] = React.useState(false);
  const canOpenDetails = editable || Boolean(onAssignTeam);

  const handleChange = React.useCallback(
    (e) => {
      setName(e.target.value);
      updateCurrentUser({ name: e.target.value });
    },
    [updateCurrentUser]
  );

  const handleColorChange = React.useCallback(
    (newColor) => {
      setColor(newColor);
      updateCurrentUser({ color: newColor });
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
          <UserDetailsFields>
            <label>
              {t("Username")}
              <StyledInputName value={name} onChange={handleChange} />
            </label>

            <ColorField>
              <span>{t("Color")}</span>
              <ColorPicker value={color} onChange={handleColorChange} />
            </ColorField>
          </UserDetailsFields>
        )}
        {onAssignTeam && (
          <TeamAssignment>
            {t("Team for {{name}}", { name: user.name })}
            <select
              aria-label={t("Team for {{name}}", { name: user.name })}
              value={assignedTeam}
              onChange={(event) => onAssignTeam(event.target.value)}
            >
              {teams.map(({ id, name }) => (
                <option key={id} value={id}>
                  {id === "players" ? t("Unassigned") : name}
                </option>
              ))}
            </select>
          </TeamAssignment>
        )}
      </Modal>
    </>
  );
};

export default UserConfig;
