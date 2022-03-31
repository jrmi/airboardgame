import React from "react";
import { useTranslation } from "react-i18next";
import { Field } from "react-final-form";

import Label from "../ui/formUtils/Label";
import Hint from "../ui/formUtils/Hint";
import Slider from "../ui/Slider";

import ActionList from "./ActionList";

import { itemTemplates } from "./";

export const getFormFieldComponent = (type) => {
  if (type in itemTemplates) {
    return itemTemplates[type].form;
  }
  return () => null;
};

const getDefaultActionsFromItem = (item) => {
  if (item.type in itemTemplates) {
    const actions = itemTemplates[item.type].defaultActions;
    if (typeof actions === "function") {
      return actions(item);
    }
    return actions;
  }

  return [];
};

const getAvailableActionsFromItem = (item) => {
  if (item.type in itemTemplates) {
    const actions = itemTemplates[item.type].availableActions;
    if (typeof actions === "function") {
      return actions(item);
    }
    return actions;
  }

  return [];
};

const getExcludedFields = (types) => {
  return types.reduce((excluded, type) => {
    return Object.assign(excluded, itemTemplates[type].excludeFields || {});
  }, {});
};

const toInt = (val) => {
  const value = parseInt(val, 10);
  if (isNaN(value)) {
    return 0;
  }
  return value;
};

const ItemForm = ({ items, types, extraExcludeFields = {} }) => {
  const { t } = useTranslation();

  let FieldsComponent;
  const oneType = types.length === 1;

  if (items.length === 1) {
    FieldsComponent = getFormFieldComponent(items[0].type);
  } else {
    if (oneType) {
      FieldsComponent = getFormFieldComponent(types[0]);
    } else {
      FieldsComponent = () => null;
    }
  }

  const defaultActions = React.useMemo(() => {
    if (oneType) {
      return getDefaultActionsFromItem(items[0]);
    }
    return undefined;
  }, [items, oneType]);

  const availableActions = React.useMemo(() => {
    if (oneType) {
      return getAvailableActionsFromItem(items[0]);
    }
    return [];
  }, [items, oneType]);

  // Merge extra excluded fields and all item excluded fields
  const excludeFields = { ...getExcludedFields(types), ...extraExcludeFields };

  let initialValues;

  // Set initial values to item values only if one element selected
  // Empty object otherwise
  if (items.length === 1) {
    initialValues = { ...items[0] };
    if (items.length === 1) {
      initialValues.actions = (initialValues.actions || defaultActions).map(
        (action) => {
          if (typeof action === "string") {
            return { name: action };
          }
          return action;
        }
      );
    }
  } else {
    initialValues = {};
  }

  return (
    <>
      {!excludeFields.locked && (
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
      )}
      {!excludeFields.rotation && (
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
                    "-180": -180,
                    "-90": -90,
                    "-45": -45,
                    "-30": -30,
                    0: 0,
                    30: 30,
                    45: 45,
                    90: 90,
                    180: 180,
                  }}
                  onChange={onChange}
                  className={"slider-rotation"}
                />
              );
            }}
          </Field>
        </Label>
      )}
      {!excludeFields.layer && (
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
                  className={"slider-layer"}
                />
              );
            }}
          </Field>
        </Label>
      )}
      <FieldsComponent initialValues={initialValues} />
      <h3>{t("Snap to grid")}</h3>
      <Label>
        {t("Grid type")}
        <Field
          name="grid.type"
          initialValue={initialValues.grid?.type}
          component="select"
        >
          <option value="none">{t("None")}</option>
          <option value="grid">{t("Grid")}</option>
          <option value="hexH">{t("Horizontal hexagons")}</option>
          <option value="hexV">{t("Vertical hexagons")}</option>
        </Field>
      </Label>
      <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
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
        <Label>
          {t("Horizontal offset")}
          <Field
            name="grid.offset.x"
            component="input"
            parse={toInt}
            initialValue={initialValues.grid?.offset?.x || 0}
          >
            {(props) => <input {...props.input} type="number" />}
          </Field>
        </Label>
        <Label>
          {t("Vertical offset")}
          <Field
            name="grid.offset.y"
            component="input"
            parse={toInt}
            initialValue={initialValues.grid?.offset?.y || 0}
          >
            {(props) => <input {...props.input} type="number" />}
          </Field>
        </Label>
      </div>

      {oneType && (
        <>
          <h3>{t("Item actions")}</h3>

          <ActionList
            name="actions"
            initialValue={initialValues.actions}
            availableActions={availableActions}
          />
        </>
      )}
    </>
  );
};

export default React.memo(ItemForm);
