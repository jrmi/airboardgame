import React from "react";

import { useTranslation } from "react-i18next";

import { useRecoilValue } from "recoil";

import { Form, Field } from "react-final-form";
import AutoSave from "../../Form/AutoSave";

import { ItemsFamily } from "../../";

import Label from "../../Form/Label";

import { getFormFieldComponent } from "./allItems";

import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const ItemFormFactory = ({ itemId, onSubmitHandler }) => {
  const { t } = useTranslation();

  const item = useRecoilValue(ItemsFamily(itemId));
  if (!item) return null;

  const FieldsComponent = getFormFieldComponent(item.type);

  return (
    <Form
      onSubmit={onSubmitHandler}
      render={() => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <AutoSave save={onSubmitHandler} />
          <div style={{ display: "none" }}>
            <Field name="id" component="input" initialValue={item.id} />
          </div>

          <Label>
            <Field
              name="locked"
              component="input"
              type="checkbox"
              initialValue={item.locked}
            />
            <span className="checkable">{t("Locked?")}</span>
          </Label>
          <Label>
            {t("Rotation")}
            <Field name="rotation" initialValue={item.rotation}>
              {({ input: { onChange, value } }) => {
                return (
                  <Slider
                    defaultValue={0}
                    value={value}
                    min={-180}
                    max={180}
                    step={5}
                    included={false}
                    marks={{
                      "-45": -45,
                      "-30": -30,
                      0: 0,
                      30: 30,
                      45: 45,
                      90: 90,
                    }}
                    onChange={onChange}
                  />
                );
              }}
            </Field>
          </Label>
          <Label>
            {t("Layer")}
            <Field name="layer" initialValue={item.layer}>
              {({ input: { onChange, value } }) => {
                return (
                  <Slider
                    defaultValue={0}
                    value={value}
                    min={-3}
                    max={3}
                    step={1}
                    included={false}
                    marks={{
                      "-3": -3,
                      "-2": -2,
                      "-1": -1,
                      0: 0,
                      "1": 1,
                      "2": 2,
                      "3": 3,
                    }}
                    onChange={onChange}
                  />
                );
              }}
            </Field>
          </Label>

          <FieldsComponent initialValues={item} />
        </div>
      )}
    />
  );
};

export default ItemFormFactory;
