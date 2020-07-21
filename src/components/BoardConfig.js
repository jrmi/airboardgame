import React from "react";
import { useTranslation } from "react-i18next";

import { Form, Field } from "react-final-form";
import AutoSave from "./Board/Form/AutoSave";
import Label from "./Board/Form/Label";
import useBoardConfig from "./useBoardConfig";

const BoardConfig = () => {
  const { t } = useTranslation();
  const [boardConfig, setBoardConfig] = useBoardConfig();

  const onSubmitHandler = (data) => {
    setBoardConfig((prev) => ({
      ...prev,
      ...data,
    }));
  };

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
            {t("Name")}
            <Field
              name="name"
              component="input"
              initialValue={boardConfig.name}
            />
          </Label>

          <Label>
            {t("Size")}
            <Field
              name="size"
              component="input"
              type="number"
              initialValue={boardConfig.size}
            />
          </Label>

          <Label>
            {t("Info")}
            <Field
              name="info"
              component="textarea"
              initialValue={boardConfig.info}
            />
          </Label>
        </div>
      )}
    />
  );
};

export default BoardConfig;
