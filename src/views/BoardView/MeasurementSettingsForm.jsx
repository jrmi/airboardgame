import React from "react";
import { Field } from "react-final-form";
import { useTranslation } from "react-i18next";
import Label from "../../ui/formUtils/Label";

const MeasurementSettingsForm = ({ config }) => {
  const { t } = useTranslation();
  return (
    <fieldset style={{ marginBottom: "2em", paddingBottom: "1em" }}>
      <legend>{t("Measurement")}</legend>
      <Label>
        {t("Unit")}
        <Field
          name="measurementUnit"
          component="select"
          initialValue={config.measurementUnit || "centimeters"}
        >
          <option value="centimeters">{t("Centimeters")}</option>
          <option value="inches">{t("Inches")}</option>
          <option value="free">{t("Free scale")}</option>
        </Field>
      </Label>
      <Field name="measurementUnit">
        {({ input: { value } }) =>
          value === "free" ? (
            <>
              <Label>
                {t("Pixels per unit")}
                <Field
                  name="pixelsPerUnit"
                  component="input"
                  type="number"
                  min="0.01"
                  step="any"
                  initialValue={config.pixelsPerUnit || 96}
                />
              </Label>
              <Label>
                {t("Unit label")}
                <Field
                  name="unitLabel"
                  component="input"
                  initialValue={config.unitLabel || "unit"}
                />
              </Label>
            </>
          ) : null
        }
      </Field>
      <Label>
        {t("Measurement line thickness (px)")}
        <Field
          name="measurementLineWidth"
          component="input"
          type="number"
          min="0.1"
          step="0.1"
          initialValue={config.measurementLineWidth || 1}
        />
      </Label>
    </fieldset>
  );
};

export default MeasurementSettingsForm;
