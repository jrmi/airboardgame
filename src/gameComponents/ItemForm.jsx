import React from "react";
import { useTranslation } from "react-i18next";
import { Field, useForm } from "react-final-form";

import Label from "../ui/formUtils/Label";
import Hint from "../ui/formUtils/Hint";
import Slider from "../ui/Slider";
import ColorPicker from "../ui/formUtils/ColorPicker";

import ActionList from "./ActionList";

import { itemTemplates } from "./";

import { objectIntersection } from "../utils";

export const getFormFieldComponent = (type) => {
  if (type in itemTemplates) {
    return itemTemplates[type].form;
  }
  return () => null;
};

const getDefaultActionsFromItem = (item) => {
  let actions = [];
  if (item.type in itemTemplates) {
    actions = itemTemplates[item.type].defaultActions;
    if (typeof actions === "function") {
      actions = actions(item);
    }
  }

  return [...new Set([...(actions || []), "toggleTeamVisibility"])];
};

const getAvailableActionsFromItem = (item) => {
  let actions = [];
  if (item.type in itemTemplates) {
    actions = itemTemplates[item.type].availableActions;
    if (typeof actions === "function") {
      actions = actions(item);
    }
  }

  return [...new Set([...(actions || []), "toggleTeamVisibility"])];
};

const normalizeActions = (item) => {
  const actions = (item.actions || getDefaultActionsFromItem(item)).map(
    (action) => (typeof action === "string" ? { name: action } : action)
  );
  const hasTeamVisibilityAction = actions.some(({ name }) =>
    ["hideForMyTeam", "makePublic", "toggleTeamVisibility"].includes(name)
  );
  const normalized = actions.filter(
    ({ name }) =>
      !["hideForMyTeam", "makePublic", "toggleTeamVisibility"].includes(name)
  );
  if (hasTeamVisibilityAction) {
    normalized.push({ name: "toggleTeamVisibility" });
  }
  return normalized;
};

export const getCombinedItemActions = (items) => {
  const actionKeys = new Set();
  return items.flatMap(normalizeActions).filter((action) => {
    const key = JSON.stringify(action);
    if (actionKeys.has(key)) return false;
    actionKeys.add(key);
    return true;
  });
};

const getEditorRotation = (rotation = 0) => {
  const normalized = ((rotation % 360) + 360) % 360;
  return normalized > 180 ? normalized - 360 : normalized;
};

export const getItemFormInitialValues = (items) => {
  const [firstItem, ...restItems] = items.map((item) => {
    const newActions = normalizeActions(item);
    return {
      ...item,
      // The rotation slider accepts only -180° through 180°. Feed it an
      // equivalent value in that range so opening the editor cannot clamp
      // stored values such as 270° or 360° to 180°.
      rotation: getEditorRotation(item.rotation),
      actions: newActions,
    };
  });

  // Set initial values to intersection of all common item values.
  return restItems.reduce(
    objectIntersection,
    JSON.parse(JSON.stringify(firstItem))
  );
};

const getExcludedFields = (types) => {
  return types.reduce((excluded, type) => {
    return Object.assign(excluded, itemTemplates[type].excludeFields || {});
  }, {});
};

const toNumber = (val) => {
  const value = Number(val);
  if (isNaN(value)) {
    return 0;
  }
  return value;
};

const rotationSteps = [1, 5, 33, 45];

const ItemForm = ({
  items,
  types,
  extraExcludeFields,
  onRotate,
  onResetRotation,
}) => {
  const { t } = useTranslation();
  const form = useForm();
  const [customRotation, setCustomRotation] = React.useState(90);
  const [useCombinedActions, setUseCombinedActions] = React.useState(false);

  const oneType = types.length === 1;

  const FieldsComponent = React.useMemo(() => {
    if (oneType) {
      return getFormFieldComponent(types[0]);
    } else {
      return () => null;
    }
  }, [oneType, types]);

  const availableActions = React.useMemo(() => {
    if (oneType) {
      return getAvailableActionsFromItem(items[0]);
    }
    return [];
  }, [items, oneType]);

  // Merge extra excluded fields and all item excluded fields
  const excludeFields = React.useMemo(() => {
    return { ...getExcludedFields(types), ...extraExcludeFields };
  }, [extraExcludeFields, types]);

  const initialValues = React.useMemo(
    () => getItemFormInitialValues(items),
    [items]
  );
  const hasCommonActions = Object.prototype.hasOwnProperty.call(
    initialValues,
    "actions"
  );
  const combinedActions = React.useMemo(
    () => getCombinedItemActions(items),
    [items]
  );

  const {
    locked = false,
    rotation,
    layer = 0,
    groupId = "",
    grid: {
      type: gridType = "",
      size: gridSize = 1,
      show: gridShow = true,
      color: gridColor = "#000000",
      opacity: gridOpacity = 0.2,
      offset: { x: gridOffsetX = 0, y: gridOffsetY = 0 } = {},
    } = {},
    actions = [],
  } = initialValues;

  return (
    <>
      {!excludeFields.locked && (
        <Label>
          <Field
            name="locked"
            component="input"
            type="checkbox"
            initialValue={locked}
          />
          <span className="checkable">{t("Locked?")}</span>
          <Hint>{t("Lock action help")}</Hint>
        </Label>
      )}
      {!excludeFields.rotation && (
        <Label as="div">
          {t("Rotation")}
          {items.length > 1 ? (
            <div className="rotation-delta-controls">
              {rotationSteps.map((amount) => (
                <React.Fragment key={amount}>
                  {[-amount, amount].map((angle) => (
                    <button
                      className="button outline"
                      key={angle}
                      onClick={() => onRotate(angle)}
                      title={t("Rotate {{angle}}°", { angle })}
                      type="button"
                    >
                      {angle > 0 ? "+" : ""}
                      {angle}°
                    </button>
                  ))}
                </React.Fragment>
              ))}
              <div className="rotation-custom-amount">
                <input
                  aria-label={t("Custom rotation amount")}
                  min="0"
                  onChange={({ target }) =>
                    setCustomRotation(Number(target.value))
                  }
                  type="number"
                  value={customRotation}
                />
                <span>°</span>
              </div>
              <div className="rotation-custom-buttons">
                <button
                  className="button outline"
                  onClick={() => onRotate(-Math.abs(customRotation || 0))}
                  title={t("Rotate {{angle}}°", {
                    angle: -Math.abs(customRotation || 0),
                  })}
                  type="button"
                >
                  −
                </button>
                <button
                  className="button outline"
                  onClick={() => onRotate(Math.abs(customRotation || 0))}
                  title={t("Rotate {{angle}}°", {
                    angle: Math.abs(customRotation || 0),
                  })}
                  type="button"
                >
                  +
                </button>
              </div>
              <button
                className="button outline rotation-reset"
                onClick={onResetRotation}
                title={t("Reset rotation to 0°")}
                type="button"
              >
                {t("Reset rotation to 0°")}
              </button>
            </div>
          ) : (
            <Field name="rotation" initialValue={rotation}>
              {({ input: { onChange, value } }) => {
                return (
                  <Slider
                    defaultValue={0}
                    value={value === "" ? 0 : value}
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
          )}
        </Label>
      )}
      {!excludeFields.layer && (
        <Label>
          {t("Layer")}
          <Field name="layer" initialValue={layer}>
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
                    1: 1,
                    2: 2,
                    3: 3,
                  }}
                  onChange={onChange}
                  className={"slider-layer"}
                />
              );
            }}
          </Field>
        </Label>
      )}
      {!excludeFields.family && (
        <Label>
          {t("Family")}
          <Field name="groupId" component="input" initialValue={groupId} />
          <Hint>
            {t(
              "Optional - Use the same family name for items that are part of the same set."
            )}
          </Hint>
        </Label>
      )}
      <FieldsComponent initialValues={initialValues} />
      {!excludeFields.grid && (
        <>
          <h3>{t("Snap to grid")}</h3>
          <Label>
            {t("Grid type")}
            <Field name="grid.type" initialValue={gridType} component="select">
              <option value="">{t("Use board grid")}</option>
              <option value="grid">{t("Grid")}</option>
              <option value="hexH">{t("Horizontal hexagons")}</option>
              <option value="hexV">{t("Vertical hexagons")}</option>
            </Field>
          </Label>
          <Label>
            <Field
              name="grid.show"
              component="input"
              type="checkbox"
              initialValue={gridShow}
            />
            <span className="checkable">{t("Display grid while moving")}</span>
          </Label>
          <Label>
            {t("Grid color")}
            <Field name="grid.color" initialValue={gridColor}>
              {({ input: { onChange, value } }) => (
                <ColorPicker value={value} onChange={onChange} />
              )}
            </Field>
          </Label>
          <Label>
            {t("Grid opacity")}
            <Field name="grid.opacity" initialValue={gridOpacity}>
              {({ input: { onChange, value } }) => (
                <Slider
                  min={0}
                  max={1}
                  step={0.05}
                  value={Number(value)}
                  onChange={onChange}
                  marks={{ 0: "0%", 0.5: "50%", 1: "100%" }}
                />
              )}
            </Field>
          </Label>
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
            <Label>
              {t("Size")}
              <Field name="grid.size" parse={toNumber} initialValue={gridSize}>
                {(props) => <input {...props.input} type="number" step="any" />}
              </Field>
            </Label>
            <Label>
              {t("Horizontal offset")}
              <Field
                name="grid.offset.x"
                component="input"
                parse={toNumber}
                initialValue={gridOffsetX}
              >
                {(props) => <input {...props.input} type="number" step="any" />}
              </Field>
            </Label>
            <Label>
              {t("Vertical offset")}
              <Field
                name="grid.offset.y"
                component="input"
                parse={toNumber}
                initialValue={gridOffsetY}
              >
                {(props) => <input {...props.input} type="number" step="any" />}
              </Field>
            </Label>
          </div>
        </>
      )}
      {oneType && (
        <>
          <h3>{t("Item actions")}</h3>
          {items.length > 1 && !hasCommonActions && !useCombinedActions ? (
            <div>
              <p>{t("Some items have different action configurations.")}</p>
              <button
                className="button outline"
                onClick={() => {
                  form.change("actions", combinedActions);
                  setUseCombinedActions(true);
                }}
                type="button"
              >
                {t("Combine actions and edit them together")}
              </button>
            </div>
          ) : (
            <ActionList
              name="actions"
              initialValue={useCombinedActions ? combinedActions : actions}
              availableActions={availableActions}
            />
          )}
        </>
      )}
    </>
  );
};

export default React.memo(ItemForm);
