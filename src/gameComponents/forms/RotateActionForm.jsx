import React from "react";
import { useTranslation } from "react-i18next";
import { Field } from "react-final-form";

import Label from "../../ui/formUtils/Label";

const Form = ({ name, initialValues = { angle: 25 } }) => {
  const { t } = useTranslation();
  return (
    <>
      <Label>
        {t("Angle")}
        <Field
          name={`${name}.angle`}
          component="input"
          parse={(value) => parseInt(value, 10) || 0}
          initialValue={initialValues.angle}
        />
      </Label>
    </>
  );
};

export default Form;
