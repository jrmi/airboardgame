import React from "react";

import { useTranslation } from "react-i18next";

import { useRecoilValue } from "recoil";

import Slider from "rc-slider";
import { Form, Field } from "react-final-form";

import AutoSave from "../../ui/formUtils/AutoSave";

import { ItemMapAtom, selectedItemsAtom } from "../Board/";
import { useItems } from "../Board/Items";

import Label from "../../ui/formUtils/Label";
import Hint from "../../ui/formUtils/Hint";

import ActionsField from "./ActionsField";

import {
  getFormFieldComponent,
  getDefaultActionsFromItem,
  getAvailableActionsFromItem,
} from ".";

const ItemFormFactory = () => {
  const { t } = useTranslation();

  const { batchUpdateItems } = useItems();

  const selectedItems = useRecoilValue(selectedItemsAtom);
  const itemMap = useRecoilValue(ItemMapAtom);

  const item = itemMap[selectedItems[0]];

  const [defaultActions] = React.useState(getDefaultActionsFromItem(item));
  const [availableActions] = React.useState(getAvailableActionsFromItem(item));

  let FieldsComponent;

  if (selectedItems.length === 1) {
    FieldsComponent = getFormFieldComponent(item.type);
  } else {
    const types = new Set(selectedItems.map((itemId) => itemMap[itemId].type));
    if (types.size === 1) {
      FieldsComponent = getFormFieldComponent(Array.from(types)[0]);
    } else {
      FieldsComponent = () => null;
    }
  }

  let initialValues;

  // Set initial values to item values if only one element selected
  // Empty object otherwise
  if (selectedItems.length === 1) {
    initialValues = { ...item };
    initialValues.actions = initialValues.actions || defaultActions;
  } else {
    initialValues = {};
  }

  const onSubmitHandler = React.useCallback(
    (formValues) => {
      batchUpdateItems(selectedItems, (item) => ({
        ...item,
        ...formValues,
      }));
    },
    [batchUpdateItems, selectedItems]
  );

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
          <Label>
            <Field
              name="locked"
              component="input"
              type="checkbox"
              initialValue={initialValues.locked}
            />
            <span className="checkable">{t("Locked?")}</span>
            <Hint>{t("Lock action help")}</Hint>
          </Label>
          <Label>
            {t("Rotation")}
            <Field name="rotation" initialValue={initialValues.rotation}>
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
                      "-90": -90,
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
            <Field name="layer" initialValue={initialValues.layer}>
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
          <FieldsComponent initialValues={initialValues} />
          <h3>{t("Snap to grid")}</h3>
          <Label>
            {t("Grid type")}
            <Field
              name="grid.type"
              initialValue={initialValues.grid?.type}
              component="select"
            >
              <option value="">{t("None")}</option>
              <option value="grid">{t("Grid")}</option>
              <option value="hexH">{t("Horizontal hexagons")}</option>
              <option value="hexV">{t("Vertical hexagons")}</option>
            </Field>
          </Label>
          <Label>
            {t("Size")}
            <Field
              name="grid.size"
              component="input"
              initialValue={initialValues.grid?.size}
            >
              {(props) => <input {...props.input} type="number" />}
            </Field>
          </Label>

          <h3>{t("Available actions")}</h3>
          <Label>
            <Field name="actions" initialValue={initialValues.actions}>
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

export default React.memo(ItemFormFactory);
