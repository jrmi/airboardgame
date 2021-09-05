import React from "react";
import { useTranslation } from "react-i18next";

import { useUsers } from "react-sync-board";

import Touch from "../ui/Touch";
import useLocalStorage from "../hooks/useLocalStorage";
import { WEBCONFERENCE } from "../utils/settings";

import WebConference from "./WebConference";

export const WeConferenceButton = ({ room }) => {
  const { t } = useTranslation();
  const { currentUser, localUsers } = useUsers();
  const [webConference, setWebConference] = useLocalStorage(
    "enableWebconference",
    false
  );

  if (!WEBCONFERENCE) {
    return null;
  }

  const icon =
    WEBCONFERENCE === "video"
      ? "https://icongr.am/material/webcam.svg?size=24&color=f9fbfa"
      : "https://icongr.am/material/microphone.svg?size=24&color=f9fbfa";

  return (
    <>
      <Touch
        onClick={() => setWebConference((prev) => !prev)}
        alt={t("Web conference")}
        title={t("Web conference")}
        icon={icon}
        active={webConference}
      />
      {webConference && (
        <WebConference
          room={room}
          currentUser={currentUser}
          users={localUsers}
          enableVideo={WEBCONFERENCE === "video"}
        />
      )}
    </>
  );
};

export default WeConferenceButton;
