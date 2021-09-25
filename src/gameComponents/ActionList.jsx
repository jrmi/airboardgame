import React from "react";
import { FieldArray } from "react-final-form-arrays";
import { useField } from "react-final-form";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import useGameItemActions from "./useGameItemActions";

const StyledActionList = styled.div`
  & .action-list {
    list-style: none;
    margin: 0;
    padding: 0 0 1em 0;
  }
  & .action-list li {
    display: flex;
    flex-direction: column;
    margin: 0.2em 0;
    padding: 0.2em 0;
    border-bottom: 1px solid #242d3e;
    & button {
      padding: 0.2em;
    }
    & .action-desc {
      display: flex;
      justify-content: space-between;
    }
    & .action-form {
      margin: 0.3em 0 0.2em 1em;
      padding: 0.5em;
      background-color: var(--bg-secondary-color);
    }
  }
`;

const Action = ({ name, onUp, onDown, onRemove }) => {
  const { t } = useTranslation();

  const {
    input: { value },
  } = useField(name);

  const [showForm, setShowForm] = React.useState(false);

  const { actionMap } = useGameItemActions();

  const { form: ActionForm, label } = actionMap[value.name];

  const hasForm = Boolean(ActionForm);

  return (
    <li>
      <div className="action-desc">
        <span>{label(value.args)}</span>
        <div className="action-actions">
          {hasForm && (
            <button
              onClick={() => setShowForm((prev) => !prev)}
              className={showForm ? "button primary" : ""}
            >
              <img
                src="https://icongr.am/feather/edit.svg?size=20&color=FFFFFF"
                alt={t("Edit action")}
                title={t("Edit action")}
              />
            </button>
          )}
          <button onClick={onUp} disabled={!onUp}>
            <img
              src="https://icongr.am/feather/arrow-up.svg?size=20&color=FFFFFF"
              alt={t("Move up")}
              title={t("Move up")}
            />
          </button>
          <button onClick={onDown} disabled={!onDown}>
            <img
              src="https://icongr.am/feather/arrow-down.svg?size=20&color=FFFFFF"
              alt={t("Move down")}
              title={t("Move down")}
            />
          </button>
          <button onClick={onRemove}>
            <img
              src="https://icongr.am/feather/x.svg?size=20&color=FFFFFF"
              alt={t("Remove")}
              title={t("Remove")}
            />
          </button>
        </div>
      </div>
      {hasForm && showForm && (
        <div className="action-form">
          <ActionForm name={`${name}.args`} initialValues={value.args} />
        </div>
      )}
    </li>
  );
};

const ActionList = ({ name, initialValue, availableActions = [] }) => {
  const { t } = useTranslation();
  const { actionMap } = useGameItemActions();

  const onAdd = (fields) => (e) => {
    const name = e.target.value;
    if (name) {
      fields.push({ name });
    }
    e.target.value = "";
  };

  return (
    <FieldArray name={name} initialValue={initialValue}>
      {({ fields }) => (
        <StyledActionList>
          <ul className="action-list">
            {fields.map((name, index) => (
              <Action
                key={name}
                name={name}
                onRemove={() => fields.remove(index)}
                onUp={index > 0 ? () => fields.swap(index, index - 1) : null}
                onDown={
                  index < fields.length - 1
                    ? () => fields.swap(index, index + 1)
                    : null
                }
              />
            ))}
          </ul>
          <select onChange={onAdd(fields)}>
            <option key={name} value={""}>
              {t("Select an action to add...")}
            </option>
            {availableActions.map((name) => {
              return (
                <option key={name} value={name}>
                  {actionMap[name].genericLabel || actionMap[name].label()}
                </option>
              );
            })}
          </select>
        </StyledActionList>
      )}
    </FieldArray>
  );
};

export default ActionList;
