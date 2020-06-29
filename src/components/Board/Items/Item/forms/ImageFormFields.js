import React from "react";
import { Field } from "react-final-form";
import { useTranslation } from "react-i18next";

import Label from "./Label";

const ImageForm = ({ initialValues }) => {
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
        {t("Text")}
        <Field
          name="text"
          component="input"
          initialValue={initialValues.text}
        />
      </Label>
      <Label>
        {t("Back Text")}
        <Field
          name="backText"
          component="input"
          initialValue={initialValues.backText}
        />
      </Label>
      <Label>
        {t("Width")}
        <Field
          name="width"
          component="input"
          initialValue={initialValues.width || initialValues.actualWidth}
        >
          {(props) => <input {...props.input} type="number" />}
        </Field>
      </Label>
      <Label>
        {t("Height")}
        <Field
          name="height"
          component="input"
          initialValue={initialValues.height || initialValues.actualHeight}
        >
          {(props) => <input {...props.input} type="number" />}
        </Field>
      </Label>
      <Label>
        {t("Front image")}
        <Field
          name="content"
          component="input"
          initialValue={initialValues.content}
        />
      </Label>
      <Label>
        {t("Back image")}
        <Field
          name="backContent"
          component="input"
          initialValue={initialValues.backContent}
        />
      </Label>
      <Label>
        {t("Overlay image")}
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
