import React from "react";
import { Field } from "react-final-form";
import { useTranslation } from "react-i18next";

import Label from "../../ui/formUtils/Label";

import { ImageField } from "../../mediaLibrary";
import { uid } from "../../utils";

const defaultLayer = () => {
  return {
    uid: uid(),
    images: [],
    side: "front",
    offset: { x: 0, y: 0 },
  };
};

const LayerForm = ({ value, index, onChange, onRemove }) => {
  const { t } = useTranslation();

  const addImage = () => {
    const images = [...value.images, { uid: uid(), type: "empty" }];

    onChange({ ...value, images });
  };

  const remove = () => {
    onRemove(value.uid);
  };

  const removeImage = (idToRemove) => {
    const images = value.images.filter(({ uid }) => uid !== idToRemove);
    onChange({ ...value, images });
  };

  const setImage = (index) => (newImage) => {
    const images = value.images.map((image, i) => {
      if (i === index) {
        return { ...image, ...newImage };
      }
      return image;
    });
    onChange({ ...value, images });
  };

  return (
    <div>
      <h3>
        {t("Layer")} {index}{" "}
        <a style={{ cursor: "pointer" }} title={t("Delete")} onClick={remove}>
          {t("X")}
        </a>
      </h3>
      <Label>
        {t("Side")}
        <Field
          name={`layers[${index}].side`}
          component="select"
          initialValue={value.side}
          style={{ width: "15em" }}
        >
          <option />
          <option value="front">{t("Front")}</option>
          <option value="back">{t("Back")}</option>
          <option value="both">{t("Both")}</option>
        </Field>
      </Label>
      {(value.images || []).map(({ uid }, index) => {
        return (
          <div key={uid}>
            <Label>
              {t("Image {{index}}", { index: index + 1 })}{" "}
              {value.images.length > 1 && (
                <a
                  style={{ cursor: "pointer" }}
                  title={t("Delete")}
                  onClick={() => removeImage(uid)}
                >
                  {t("X")}
                </a>
              )}
              <ImageField
                value={value.images[index]}
                onChange={setImage(index)}
              />
            </Label>
          </div>
        );
      })}
      <button onClick={addImage} style={{ marginTop: "0.5em" }}>
        {t("Add image")}
      </button>
    </div>
  );
};

const LayersForm = ({ value, onChange }) => {
  const { t } = useTranslation();
  const addLayer = () => {
    onChange([...value, defaultLayer()]);
  };

  const onLayerChange = (newLayerValue) => {
    const newValue = value.map((layer) => {
      if (layer.uid === newLayerValue.uid) {
        return newLayerValue;
      }
      return layer;
    });
    onChange(newValue);
  };

  const onRemove = (layerIdToRemove) => {
    const newValue = value.filter(({ uid }) => uid !== layerIdToRemove);
    onChange(newValue);
  };

  return (
    <>
      {value.map((layer, index) => {
        return (
          <LayerForm
            value={layer}
            onChange={onLayerChange}
            onRemove={onRemove}
            index={index}
            key={layer.uid}
          />
        );
      })}
      <button style={{ marginTop: "0.5em" }} onClick={addLayer}>
        {t("Add layer")}
      </button>
    </>
  );
};

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
        <Field name="front" initialValue={initialValues.front}>
          {({ input: { value, onChange } }) => {
            return <ImageField value={value} onChange={onChange} />;
          }}
        </Field>
      </Label>

      <Label>
        {t("Back image")}
        <Field name="back" initialValue={initialValues.back}>
          {({ input: { value, onChange } }) => {
            return <ImageField value={value} onChange={onChange} />;
          }}
        </Field>
      </Label>

      <Label>
        {t("Layers")}
        <Field name="layers" initialValue={initialValues.layers}>
          {({ input: { value, onChange } }) => {
            return <LayersForm value={value} onChange={onChange} />;
          }}
        </Field>
      </Label>
    </>
  );
};

export default ImageForm;
