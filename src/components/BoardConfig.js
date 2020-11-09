import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import { Form, Field } from "react-final-form";
import AutoSave from "../ui/formUtils/AutoSave";
import Label from "../ui/formUtils/Label";
import useBoardConfig from "./useBoardConfig";

import { Range } from "rc-slider";
import { nanoid } from "nanoid";

const BoardConfigForm = styled.div`
  display: flex;
  flex-direction: column;
  & .trash {
    float: right;
  }
`;

const BoardConfig = () => {
  const { t } = useTranslation();
  const [boardConfig, setBoardConfig] = useBoardConfig();

  const [defaultPlayerCount] = React.useState([]);

  const onSubmitHandler = React.useCallback(
    (data) => {
      setBoardConfig((prev) => ({
        ...prev,
        ...data,
      }));
    },
    [setBoardConfig]
  );

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

  return (
    <Form
      onSubmit={onSubmitHandler}
      render={() => (
        <BoardConfigForm>
          <AutoSave save={onSubmitHandler} />
          <Label>
            {t("Players count")}
            <Field
              name="playerCount"
              initialValue={boardConfig.playerCount || defaultPlayerCount}
            >
              {({ input: { onChange, value } }) => {
                return (
                  <Range
                    defaultValue={[2, 4]}
                    value={value}
                    min={1}
                    max={9}
                    step={1}
                    marks={{
                      1: "1",
                      2: "2",
                      3: "3",
                      4: "4",
                      5: "5",
                      6: "6",
                      7: "7",
                      8: "8",
                      9: "9+",
                    }}
                    style={{ width: "20em" }}
                    onChange={onChange}
                    dots
                  />
                );
              }}
            </Field>
          </Label>
          <Label>
            {t("Duration")}
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
                  <Range
                    defaultValue={[2, 4]}
                    value={value}
                    min={15}
                    max={90}
                    step={null}
                    marks={{
                      15: "15",
                      30: "30",
                      45: "45",
                      60: "60",
                      90: "90+",
                    }}
                    style={{ width: "20em" }}
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
          <Label>
            {t("Board size")}
            <Field
              name="size"
              component="input"
              initialValue={boardConfig.size}
              style={{ width: "5em", textAlign: "right" }}
            />
          </Label>
          <Label>
            {t("Material language")}
            <Field
              name="materialLanguage"
              component="select"
              initialValue={boardConfig.materialLanguage}
              style={{ width: "20em" }}
            >
              <option />
              <option value="Multi-lang">🌍 {t("Multi-lang")}</option>
              <option value="en">🇬🇧 {t("en")}</option>
              <option value="fr">🇫🇷 {t("fr")}</option>
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
                <option value="en">🇬🇧 {t("en")}</option>
                <option value="fr">🇫🇷 {t("fr")}</option>
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
              {t("Description")}
              <Field
                name="defaultDescription"
                component="textarea"
                initialValue={
                  boardConfig.defaultDescription || boardConfig.info
                }
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
                    <img
                      src="https://icongr.am/feather/trash.svg?size=25&color=ffffff"
                      alt={t("Remove")}
                    />
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
                      <option value="en">🇬🇧 {t("en")}</option>
                      <option value="fr">🇫🇷 {t("fr")}</option>
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
          <Label>
            {t("Publish")}
            <Field
              name="published"
              component="input"
              type="checkbox"
              initialValue={boardConfig.published}
            />
          </Label>
        </BoardConfigForm>
      )}
    />
  );
};

export default BoardConfig;
