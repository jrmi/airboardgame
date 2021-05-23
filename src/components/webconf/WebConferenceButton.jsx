import React from "react";
import { useTranslation } from "react-i18next";

import Touch from "../../ui/Touch";
import useLocalStorage from "../../hooks/useLocalStorage";

import WebConference from "./WebConference";

export const WeConferenceButton = ({ room }) => {
  const { t } = useTranslation();
  const [webConference, setWebConference] = useLocalStorage(
    "enableWebconference",
    false
  );

  return (
    <>
      <Touch
        onClick={() => setWebConference((prev) => !prev)}
        alt={t("Web conference")}
        title={t("Web conference")}
        icon="https://icongr.am/material/message-video.svg?size=24&color=f9fbfa"
        active={webConference}
      />
      {webConference && <WebConference room={room} />}
    </>
  );
};

export default WeConferenceButton;
