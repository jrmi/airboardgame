import React from "react";

import Label from "../../ui/formUtils/Label";

import useItemActions from "./useItemActions";
import { Field } from "react-final-form";

const ActionsField = ({
  value: globalValue,
  onChange: globalOnChange,
  availableActions,
}) => {
  const { actionMap } = useItemActions();
  return (
    <div>
      {availableActions.map((action) => {
        const { label } = actionMap[action];
        return (
          <Label key={action}>
            <Field value={globalValue.includes(action)} type="checkbox">
              {({ input: { value } }) => {
                const toggleAction = (e) => {
                  if (e.target.checked) {
                    globalOnChange([...globalValue, action]);
                  } else {
                    globalOnChange(globalValue.filter((act) => act !== action));
                  }
                };
                return (
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={toggleAction}
                  />
                );
              }}
            </Field>
            <span className="checkable">{label}</span>
          </Label>
        );
      })}
    </div>
  );
};

export default ActionsField;
