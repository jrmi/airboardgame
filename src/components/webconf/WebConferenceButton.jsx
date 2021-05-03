import React from "react";
import { useTranslation } from "react-i18next";

import Touch from "../../ui/Touch";

import WebConference from "./WebConference";

export const WeConferenceButton = () => {
  const { t } = useTranslation();
  const [webConference, setWebConference] = React.useState(false);

  return (
    <>
      <Touch
        onClick={() => setWebConference((prev) => !prev)}
        alt={t("Web conference")}
        title={t("Web conference")}
        icon={"video-camera"}
        active={webConference}
      />
      {webConference && <WebConference />}
    </>
  );
};

export default WeConferenceButton;
