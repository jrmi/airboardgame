import React from "react";
import { Field } from "react-final-form";

import Label from "./Label";

import ColorPicker from "./ColorPicker";

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

      <Label>
        Color:
        <Field
          name="color"
          component="input"
          initialValue={initialValues.color}
        >
          {({ input: { onChange, value } }) => (
            <ColorPicker value={value} onChange={onChange} />
          )}
        </Field>
      </Label>
    </>
  );
};

export default Form;
