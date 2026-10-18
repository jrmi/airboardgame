import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

import Label from "../../ui/formUtils/Label";
import Hint from "../../ui/formUtils/Hint";

const StyledFieldset = styled.fieldset`
  margin-bottom: 2em;
  padding-bottom: 1em;
`;

const InteractionSettingsForm = ({ interaction, setInteraction }) => {
  const { t } = useTranslation();

  const updateInteraction = React.useCallback(
    (changes) => {
      setInteraction((previous) => ({ ...previous, ...changes }));
    },
    [setInteraction]
  );

  return (
    <StyledFieldset>
      <legend>{t("Board interaction")}</legend>
      <Label>
        {t("Navigation mode")}
        <select
          value={interaction.navigationMode}
          onChange={(event) =>
            updateInteraction({ navigationMode: event.target.value })
          }
        >
          <option value="auto">{t("Automatic")}</option>
          <option value="wheel">{t("Mouse wheel")}</option>
          <option value="trackpad">{t("Trackpad")}</option>
        </select>
        <Hint>{t("Choose how scrolling moves and zooms the board.")}</Hint>
      </Label>
      <Label>
        {t("Primary action")}
        <select
          value={interaction.primaryAction}
          onChange={(event) =>
            updateInteraction({ primaryAction: event.target.value })
          }
        >
          <option value="pan">{t("Move")}</option>
          <option value="select">{t("Select")}</option>
        </select>
      </Label>
      <Label>
        {t("Zoom sensitivity")}
        <input
          type="number"
          min="0.1"
          step="0.1"
          placeholder={t("Default")}
          value={interaction.zoomMultiplier ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            updateInteraction({
              zoomMultiplier: value === "" ? undefined : Number(value),
            });
          }}
        />
        <Hint>{t("Leave blank to use the navigation mode default.")}</Hint>
      </Label>
      <Label>
        {t("Enable momentum")}
        <input
          type="checkbox"
          checked={interaction.inertia !== false}
          onChange={(event) =>
            updateInteraction({ inertia: event.target.checked })
          }
        />
      </Label>
      <Label>
        {t("Momentum amount")}
        <input
          type="number"
          min="0.1"
          step="0.1"
          disabled={interaction.inertia === false}
          value={interaction.inertiaAmount ?? 1}
          onChange={(event) => {
            const value = event.target.value;
            updateInteraction({
              inertiaAmount: value === "" ? undefined : Number(value),
            });
          }}
        />
      </Label>
    </StyledFieldset>
  );
};

export default InteractionSettingsForm;
