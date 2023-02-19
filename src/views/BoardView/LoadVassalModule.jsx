import React from "react";
import { useTranslation } from "react-i18next";

import { useDropzone } from "react-dropzone";

import useSession from "../../hooks/useSession";
import { loadVassalModuleInSession } from "../../utils/vassal.js";

const LoadGame = ({ onLoad = () => {} }) => {
  const { t } = useTranslation();
  const { sessionId, saveSession } = useSession();
  const [loading, setLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [messages, setMessages] = React.useState([]);

  const onDrop = React.useCallback(
    async (acceptedFiles) => {
      setLoading(true);
      await saveSession(true);
      const result = await loadVassalModuleInSession(
        acceptedFiles[0],
        sessionId,
        (progress, message) => {
          setProgress(progress);
          setMessages((prev) => {
            const newMessage = [...prev, message];
            if (newMessage.length > 5) {
              newMessage.shift();
            }
            return newMessage;
          });
        },
        false
      );
      onLoad(result);
    },
    [onLoad, saveSession, sessionId]
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  if (!loading) {
    return (
      <div
        {...getRootProps()}
        style={{
          border: "1px dashed white",
          padding: "0.5em",
          cursor: "pointer",
          fontSize: "1.5em",
        }}
      >
        <input {...getInputProps()} />
        <p style={{ textAlign: "center", margin: "1em" }}>
          {t("Drag'n'drop a vassal module here")}
        </p>
      </div>
    );
  } else {
    return (
      <div>
        <h2>{t("Loading...") + `${progress}%`}</h2>
        <ul>
          {messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      </div>
    );
  }
};

export default LoadGame;
