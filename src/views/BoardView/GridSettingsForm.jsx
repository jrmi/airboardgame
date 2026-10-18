import React from "react";
import styled from "styled-components";
import { Field } from "react-final-form";
import { useTranslation } from "react-i18next";

import Slider from "../../ui/Slider";
import ColorPicker from "../../ui/formUtils/ColorPicker";

const StyledFieldset = styled.fieldset`
  margin-bottom: 2em;
  padding-bottom: 2.5em;

  &::after {
    content: "";
    display: block;
    clear: both;
  }
`;

const FieldRow = styled.label`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 1em;
  min-height: 2.6em;

  & + & {
    margin-top: 0.7em;
  }

  & input[type="number"],
  & select {
    width: 10em;
  }
`;

const SliderRow = styled.div`
  margin-top: 1.4em;
  clear: both;

  & > span {
    display: block;
    margin-bottom: 0.5em;
  }
`;

const GridSettingsForm = ({ grid = {} }) => {
  const { t } = useTranslation();

  return (
    <StyledFieldset>
      <legend>{t("Moving grid")}</legend>
      <Field name="grid.type" initialValue={grid.type || "none"}>
        {({ input }) => (
          <>
            <FieldRow>
              <span>{t("Grid type")}</span>
              <select {...input}>
                <option value="none">{t("None")}</option>
                <option value="grid">{t("Grid")}</option>
                <option value="hexH">{t("Horizontal hexagons")}</option>
                <option value="hexV">{t("Vertical hexagons")}</option>
              </select>
            </FieldRow>
            {input.value !== "none" && <GridOptions grid={grid} />}
          </>
        )}
      </Field>
    </StyledFieldset>
  );
};

const GridOptions = ({ grid }) => {
  const { t } = useTranslation();

  return (
    <>
      <FieldRow>
        <span>{t("Magnetic Grid size")}</span>
        <Field
          name="grid.size"
          component="input"
          type="number"
          step="any"
          min="0.01"
          parse={Number}
          initialValue={grid.size || 1}
        />
      </FieldRow>
      <FieldRow>
        <span>{t("Display board grid while moving")}</span>
        <Field
          name="grid.show"
          component="input"
          type="checkbox"
          initialValue={grid.show || false}
        />
      </FieldRow>
      <FieldRow>
        <span>{t("Grid color")}</span>
        <Field name="grid.color" initialValue={grid.color || "#000000"}>
          {({ input: { onChange, value } }) => (
            <ColorPicker value={value} onChange={onChange} />
          )}
        </Field>
      </FieldRow>
      <SliderRow>
        <span>{t("Grid opacity")}</span>
        <Field name="grid.opacity" initialValue={grid.opacity ?? 0.2}>
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
      </SliderRow>
    </>
  );
};

export default GridSettingsForm;
