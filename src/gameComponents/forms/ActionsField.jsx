import React from "react";

import Label from "../../components/ui/formUtils/Label";

import { Field } from "react-final-form";

const ActionsField = ({
  value: globalValue,
  onChange: globalOnChange,
  availableActions,
  actionMap,
}) => {
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
