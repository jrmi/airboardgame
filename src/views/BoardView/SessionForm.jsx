import React from "react";
import { useTranslation } from "react-i18next";
import { Field } from "react-final-form";
import { useBoardConfig } from "react-sync-board";

import Label from "../../ui/formUtils/Label";
import Hint from "../../ui/formUtils/Hint";

import { backgrounds } from "../../gameComponents";

const BoardConfigForm = () => {
  const { t } = useTranslation();

  const [boardConfig] = useBoardConfig();

  const CurrentBgForm = backgrounds.find(
    ({ type }) => type === (boardConfig.bgType || "default")
  )?.form;

  return (
    <>
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
        {t("Limit board dragging")}
        <Field
          name="limitPan"
          component="input"
          type="checkbox"
          initialValue={boardConfig.limitPan}
        />
        <Hint>
          {t(
            "Check it to keep the board tethered near the items when dragging. Uncheck to allow unlimited dragging."
          )}
        </Hint>
      </Label>
    </>
  );
};

export default BoardConfigForm;
