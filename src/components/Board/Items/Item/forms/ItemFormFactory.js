import React from "react";

import { useTranslation } from "react-i18next";

import { useRecoilValue } from "recoil";

import { Form, Field } from "react-final-form";
import AutoSave from "../../../Form/AutoSave";

import { ItemListAtom } from "../../../";

import ImageFormFields from "./ImageFormFields";
import CounterFormFields from "./CounterFormFields";
import RectFormFields from "./RectFormFields";
import RoundFormFields from "./RoundFormFields";
import DiceFormFields from "./DiceFormFields";
import NoteFormFields from "./NoteFormFields";

import Label from "../../../Form/Label";

import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const getFormFieldComponent = (type) => {
  switch (type) {
    case "rect":
      return RectFormFields;
    case "round":
      return RoundFormFields;
    case "dice":
      return DiceFormFields;
    case "counter":
      return CounterFormFields;
    case "note":
      return NoteFormFields;
    case "image":
      return ImageFormFields;
    default:
      return () => {
        return null;
      };
  }
};

const ItemFormFactory = ({ itemId, onSubmitHandler }) => {
  const { t } = useTranslation();
  const itemList = useRecoilValue(ItemListAtom);
  const item = itemList.find(({ id }) => id === itemId);
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
