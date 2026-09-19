import React from "react";
import { useTranslation } from "react-i18next";
import { nanoid } from "nanoid";
import { Field } from "react-final-form";
import { useBoardConfig } from "react-sync-board";

import Hint from "../../ui/formUtils/Hint";
import Label from "../../ui/formUtils/Label";
import SliderRange from "../../ui/SliderRange";
import Slider from "../../ui/Slider";
import ColorPicker from "../../ui/formUtils/ColorPicker";

import { ImageField } from "../../mediaLibrary";

import { backgrounds } from "../../gameComponents";
import { FiTrash2 } from "react-icons/fi";

const BoardConfigForm = () => {
  const { t } = useTranslation();

  const [boardConfig, setBoardConfig] = useBoardConfig();

  const [defaultPlayerCount] = React.useState([]);

  const addTranslation = React.useCallback(() => {
    setBoardConfig((prev) => ({
      ...prev,
      translations: [...(prev.translations || []), { id: nanoid() }],
    }));
  }, [setBoardConfig]);

  const removeTranslation = (idToRemove) => {
    setBoardConfig((prev) => ({
      ...prev,
      translations: prev.translations.filter(({ id }) => id !== idToRemove),
    }));
  };

  const CurrentBgForm = backgrounds.find(
    ({ type }) => type === (boardConfig.bgType || "default")
  )?.form;

  return (
    <>
      <Label>
        {t("Publish")}
        <Field
          name="published"
          component="input"
          type="checkbox"
          initialValue={boardConfig.published}
        />
        <Hint>{t("Check it to make your board publicly visible")}</Hint>
      </Label>
      <fieldset style={{ marginBottom: "2em", paddingBottom: "1em" }}>
        <legend>{t("Background")}</legend>

        <Label>{t("Type")}</Label>
        <Field
          name="bgType"
          component="select"
          initialValue={boardConfig.bgType || "default"}
        >
          {backgrounds.map((bg) => {
            return (
              <option key={bg.type} value={bg.type}>
                {bg.name}
              </option>
            );
          })}
        </Field>
        <div style={{ paddingTop: "1em" }}>
          {CurrentBgForm && (
            <Field name="bgConf" initialValue={boardConfig.bgConf}>
              {({ input: { onChange, value } }) => {
                return <CurrentBgForm value={value} onChange={onChange} />;
              }}
            </Field>
          )}
        </div>
      </fieldset>
      <Label>
        {t("Number of players")}
        <Field
          name="playerCount"
          initialValue={boardConfig.playerCount || defaultPlayerCount}
        >
          {({ input: { onChange, value } }) => {
            return (
              <SliderRange
                defaultValue={[2, 4]}
                value={value}
                min={1}
                max={9}
                step={1}
                onChange={onChange}
              />
            );
          }}
        </Field>
      </Label>
      <Label>
        {t("Duration (mins)")}
        <Field
          name="duration"
          initialValue={
            Array.isArray(boardConfig.duration)
              ? boardConfig.duration
              : defaultPlayerCount
          }
        >
          {({ input: { onChange, value } }) => {
            return (
              <SliderRange
                defaultValue={[15, 90]}
                value={value}
                min={15}
                max={90}
                step={15}
                onChange={onChange}
              />
            );
          }}
        </Field>
      </Label>
      <Label>
        {t("Minimal age (years)")}
        <Field
          name="minAge"
          component="input"
          initialValue={boardConfig.minAge}
          style={{ width: "5em", textAlign: "right" }}
        />
      </Label>
      <fieldset style={{ marginBottom: "2em", paddingBottom: "1em" }}>
        <legend>{t("Moving grid")}</legend>
        <Label>
          {t("Grid type")}
          <Field
            name="grid.type"
            component="select"
            initialValue={boardConfig.grid?.type || "none"}
          >
            <option value="none">{t("None")}</option>
            <option value="grid">{t("Grid")}</option>
            <option value="hexH">{t("Horizontal hexagons")}</option>
            <option value="hexV">{t("Vertical hexagons")}</option>
          </Field>
        </Label>
        <Label>
          {t("Magnetic Grid size")}
          <Field
            name="grid.size"
            component="input"
            type="number"
            step="any"
            min="0.01"
            parse={Number}
            initialValue={boardConfig.grid?.size || 1}
            style={{ width: "5em", textAlign: "right" }}
          />
        </Label>
        <Label>
          {t("Display board grid while moving")}
          <Field
            name="grid.show"
            component="input"
            type="checkbox"
            initialValue={boardConfig.grid?.show || false}
          />
        </Label>
        <Label>
          {t("Grid color")}
          <Field
            name="grid.color"
            initialValue={boardConfig.grid?.color || "#000000"}
          >
            {({ input: { onChange, value } }) => (
              <ColorPicker value={value} onChange={onChange} />
            )}
          </Field>
        </Label>
        <Label>
          {t("Grid opacity")}
          <Field
            name="grid.opacity"
            initialValue={boardConfig.grid?.opacity ?? 0.2}
          >
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
      </fieldset>
      <Label>
        {t("Main image")}
        <Field name="imageUrl" initialValue={boardConfig.imageUrl}>
          {({ input: { value, onChange } }) => {
            return <ImageField value={value} onChange={onChange} />;
          }}
        </Field>
        <Hint>
          {t("Image ideal resolution: 482x310px or an aspect ratio of 1.55")}
        </Hint>
      </Label>
      <Label>
        {t("Material language")}
        <Field
          name="materialLanguage"
          component="select"
          initialValue={boardConfig.materialLanguage}
          style={{ width: "10em" }}
        >
          <option />
          <option value="Multi-lang">🌍 {t("Multi-lang")}</option>
          <option value="en">🇬🇧 {t("English")}</option>
          <option value="fr">🇫🇷 {t("French")}</option>
        </Field>
      </Label>
      <fieldset style={{ marginBottom: "2em", paddingBottom: "1em" }}>
        <legend>{t("Informations")}</legend>

        <Label>
          {t("Default language")}
          <Field
            name="defaultLanguage"
            component="select"
            initialValue={boardConfig.defaultLanguage}
            style={{ width: "15em" }}
          >
            <option />
            <option value="en">🇬🇧 {t("English")}</option>
            <option value="fr">🇫🇷 {t("French")}</option>
          </Field>
        </Label>

        <Label>
          {t("Game name")}
          <Field
            name="defaultName"
            component="input"
            initialValue={boardConfig.defaultName || boardConfig.name}
            style={{ width: "15em" }}
          />
        </Label>

        <Label>
          {t("Keep title")}
          <Field
            name="keepTitle"
            component="input"
            type="checkbox"
            initialValue={boardConfig.keepTitle}
          />
          <Hint>
            {t("Check it to keep the game title above the game image.")}
          </Hint>
        </Label>

        <Label>
          {t("Baseline")}
          <Field
            name="defaultBaseline"
            component="input"
            initialValue={boardConfig.defaultBaseline}
            style={{ width: "100%" }}
          />
        </Label>

        <Label>
          {t("Description")}
          <Field
            name="defaultDescription"
            component="textarea"
            initialValue={boardConfig.defaultDescription || boardConfig.info}
            style={{ minHeight: "10em" }}
          />
        </Label>
      </fieldset>
      <div>
        {(boardConfig.translations || []).map(({ id }, index) => {
          return (
            <fieldset
              style={{ marginBottom: "2em", paddingBottom: "1em" }}
              key={id}
            >
              <legend>
                {t("Translation")} {index}
              </legend>

              <button
                className="button clear icon-only trash"
                onClick={() => removeTranslation(id)}
              >
                <FiTrash2 size="25" color="white" alt={t("Remove")} />
              </button>

              <Label>
                {t("Language")}
                <Field
                  name={`translations[${index}].language`}
                  component="select"
                  initialValue={boardConfig.translations[index].language}
                  style={{ width: "15em" }}
                >
                  <option />
                  <option value="en">🇬🇧 {t("English")}</option>
                  <option value="fr">🇫🇷 {t("French")}</option>
                </Field>
              </Label>

              <Label>
                {t("Game name")}
                <Field
                  name={`translations[${index}].name`}
                  component="input"
                  initialValue={boardConfig.translations[index].name}
                  style={{ width: "15em" }}
                />
              </Label>

              <Label>
                {t("Baseline")}
                <Field
                  name={`translations[${index}].baseline`}
                  component="input"
                  initialValue={boardConfig.translations[index].baseline}
                  style={{ width: "100%" }}
                />
              </Label>

              <Label>
                {t("Description")}
                <Field
                  name={`translations[${index}].description`}
                  component="textarea"
                  initialValue={boardConfig.translations[index].description}
                  style={{ minHeight: "10em" }}
                />
              </Label>
            </fieldset>
          );
        })}
        <button onClick={addTranslation}>{t("Add translation")}</button>
      </div>
    </>
  );
};

export default BoardConfigForm;
