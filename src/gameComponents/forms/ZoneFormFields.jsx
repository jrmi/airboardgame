import React from "react";
import { useTranslation } from "react-i18next";
import { Field } from "react-final-form";
import Label from "../../ui/formUtils/Label";
import Hint from "../../ui/formUtils/Hint";

import ActionsField from "../../components/Board/Items/ActionsField";
import useGameItemActionMap from "../useGameItemActionMap";

const interactions = ["reveal", "hide", "revealSelf", "stack"];

const Form = ({ initialValues }) => {
  const { t } = useTranslation();
  const actionMap = useGameItemActionMap();
  return (
    <>
      <Label>
        {t("Label")}
        <Field
          name="label"
          component="input"
          initialValue={initialValues.label}
        />
      </Label>
      <Label>
        {t("Width")}
        <Field
          name="width"
          component="input"
          initialValue={initialValues.width}
        >
          {(props) => <input {...props.input} type="number" />}
        </Field>
      </Label>
      <Label>
        {t("Height")}
        <Field
          name="height"
          component="input"
          initialValue={initialValues.height}
        >
          {(props) => <input {...props.input} type="number" />}
        </Field>
      </Label>
      <h3>{t("Interactions")}</h3>
      <Hint>{t("Interaction help")}</Hint>
      <Label>
        <Field name="onItem" initialValue={initialValues.onItem}>
          {({ input: { onChange, value } }) => (
            <ActionsField
              onChange={onChange}
              value={value}
              availableActions={interactions}
              actionMap={actionMap}
            />
          )}
        </Field>
      </Label>
    </>
  );
};

export default Form;
