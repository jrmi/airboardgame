import React from "react";
import { Field } from "react-final-form";

import Label from "./Label";

const Form = ({ initialValues }) => {
  return (
    <>
      <Label>
        Label:
        <Field
          name="label"
          component="input"
          initialValue={initialValues.label}
        />
      </Label>
    </>
  );
};

export default Form;
