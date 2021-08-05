import React from "react";
import { useTranslation } from "react-i18next";
import { Field } from "react-final-form";

import Label from "../../components/ui/formUtils/Label";
import Hint from "../../components/ui/formUtils/Hint";

import ActionsField from "./ActionsField";
import actionMap from "../actionMap";

const interactions = ["reveal", "hide", "revealSelf", "stack"];

const Form = ({ initialValues }) => {
  const { t } = useTranslation();
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
