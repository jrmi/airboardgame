import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { useDropzone } from "react-dropzone";

const API_ENDPOINT =
  process.env.REACT_APP_API_ENDPOINT || "http://localhost:3001";

const uploadURI = `${API_ENDPOINT}/upload`;

const Thumbnail = styled.img`
  height: 50px;
  max-width: 50px;
`;

const RemoveButton = styled.span`
  position: absolute;
  top: 1px;
  right: 1px;
`;

const ImageField = ({ value, onChange }) => {
  const { t } = useTranslation();
  const [uploading, setUploading] = React.useState(false);

  const onDrop = React.useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      setUploading(true);
      const payload = new FormData();
      payload.append("file", file);
      const result = await fetch(uploadURI, {
        method: "POST",
        body: payload, // this sets the `Content-Type` header to `multipart/form-data`
      });

      const location = await result.text();
      setUploading(false);
      onChange(location);
    },
    [onChange]
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleRemove = React.useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      onChange(null);
      return false;
    },
    [onChange]
  );

  return (
    <div style={{ position: "relative" }}>
      {!value && !uploading && <p>{t("No image")}</p>}
      {uploading && <p>{t("Sending file...")}</p>}
      {value && <Thumbnail src={value} />}
      {value && <RemoveButton onClick={handleRemove}>X</RemoveButton>}
      <div
        {...getRootProps()}
        style={{
          border: "3px dashed black",
          margin: "0.5em",
          padding: "0.5em",
        }}
      >
        <input {...getInputProps()} />
        <p>{t("Click or drag'n'drop file here")}</p>
      </div>
    </div>
  );
};

export default ImageField;
