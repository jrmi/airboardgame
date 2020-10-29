import React from "react";

import { useTranslation } from "react-i18next";

import { useRecoilValue } from "recoil";

import { Form, Field } from "react-final-form";
import AutoSave from "../../ui/formUtils/AutoSave";

import { ItemMapAtom } from "../Board/";

import Label from "../../ui/formUtils/Label";

import {
  getFormFieldComponent,
  getDefaultActionsFromItem,
  getAvailableActionsFromItem,
} from ".";

import ActionsField from "./ActionsField";

import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const ItemFormFactory = ({ itemId, onSubmitHandler }) => {
  const { t } = useTranslation();

  const itemMap = useRecoilValue(ItemMapAtom);
  const item = itemMap[itemId];
  const [defaultActions] = React.useState(getDefaultActionsFromItem(item));
  const [availableActions] = React.useState(getAvailableActionsFromItem(item));

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
          <h3>{t("Available actions")}</h3>
          <Label>
            <Field name="actions" initialValue={item.actions || defaultActions}>
              {({ input: { onChange, value } }) => (
                <ActionsField
                  onChange={onChange}
                  value={value}
                  availableActions={availableActions}
                />
              )}
            </Field>
          </Label>
        </div>
      )}
    />
  );
};

export default ItemFormFactory;
