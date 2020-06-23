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
        Width:
        <Field
          name="width"
          component="input"
          initialValue={initialValues.width}
        >
          {(props) => <input {...props.input} type="number" />}
        </Field>
      </Label>
      <Label>
        Height:
        <Field
          name="height"
          component="input"
          initialValue={initialValues.height}
        >
          {(props) => <input {...props.input} type="number" />}
        </Field>
      </Label>
    </>
  );
};

export default Form;
