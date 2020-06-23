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
      <Label>
        Radius:
        <Field
          name="radius"
          component="input"
          initialValue={initialValues.radius}
        >
          {(props) => <input {...props.input} type="number" />}
        </Field>
      </Label>
    </>
  );
};

export default Form;
