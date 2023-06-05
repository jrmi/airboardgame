import React from "react";
import { Field } from "react-final-form";
import { useTranslation } from "react-i18next";
import { useField } from "react-final-form";

import { getImage } from "../../utils/image";

import Label from "../../ui/formUtils/Label";

import { ImageField, media2Url } from "../../mediaLibrary";

const ImageForm = ({ initialValues }) => {
  const { t } = useTranslation();
  const {
    input: { onChange: onWidthChange },
  } = useField("width");
  const {
    input: { onChange: onHeightChange },
  } = useField("height");

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
      <Label>
        {t("Front image")}
        <Field name="content" initialValue={initialValues.content}>
          {({ input: { value, onChange } }) => {
            const onFrontImageChange = (newValue) => {
              // Propagate change
              onChange(newValue);

              const url = media2Url(newValue);
              if (url) {
                getImage(url).then((image) => {
                  if (image?.width && image?.height) {
                    // Update item dimension if possible
                    onWidthChange(image.width);
                    onHeightChange(image.height);
                  }
                });
              }
            };

            return <ImageField value={value} onChange={onFrontImageChange} />;
          }}
        </Field>
      </Label>

      <Label>
        {t("Back image")}
        <Field name="backContent" initialValue={initialValues.backContent}>
          {({ input: { value, onChange } }) => {
            return <ImageField value={value} onChange={onChange} />;
          }}
        </Field>
      </Label>
      <Label>
        {t("Overlay image")}
        <Field
          name="overlay.content"
          initialValue={
            initialValues.overlay ? initialValues.overlay.content : ""
          }
        >
          {({ input: { value, onChange } }) => {
            return <ImageField value={value} onChange={onChange} />;
          }}
        </Field>
      </Label>
    </>
  );
};

export default ImageForm;
