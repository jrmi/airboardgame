import React from "react";
import { Field } from "react-final-form";

import Label from "./Label";

const ImageForm = ({ initialValues }) => {
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
        Text:
        <Field
          name="text"
          component="input"
          initialValue={initialValues.text}
        />
      </Label>
      <Label>
        Back Text:
        <Field
          name="backText"
          component="input"
          initialValue={initialValues.backText}
        />
      </Label>
      <Label>
        Width:
        <Field
          name="width"
          component="input"
          initialValue={initialValues.width || initialValues.actualWidth}
        >
          {(props) => <input {...props.input} type="number" />}
        </Field>
      </Label>
      <Label>
        Height:
        <Field
          name="height"
          component="input"
          initialValue={initialValues.height || initialValues.actualHeight}
        >
          {(props) => <input {...props.input} type="number" />}
        </Field>
      </Label>
      <Label>
        Front image:
        <Field
          name="content"
          component="input"
          initialValue={initialValues.content}
        />
      </Label>
      <Label>
        Back image:
        <Field
          name="backContent"
          component="input"
          initialValue={initialValues.backContent}
        />
      </Label>
      <Label>
        Overlay image:
        <Field
          name="overlay.content"
          component="input"
          initialValue={
            initialValues.overlay ? initialValues.overlay.content : ""
          }
        />
      </Label>
    </>
  );
};

export default ImageForm;
