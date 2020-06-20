import React from "react";
import { Form, Field } from "react-final-form";

const ImageForm = ({ initialValues, onSubmit }) => {
  return (
    <Form
      onSubmit={onSubmit}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <div style={{ display: "none" }}>
            <Field
              name="id"
              component="input"
              initialValue={initialValues.id}
            />
          </div>
          <div>
            <label>Label</label>
            <Field
              name="label"
              component="input"
              initialValue={initialValues.label}
            />
          </div>

          <button type="submit">Submit</button>
        </form>
      )}
    />
  );
};

export default ImageForm;
