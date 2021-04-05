import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { useDropzone } from "react-dropzone";
import { media2Url } from "../../utils/media";

const Thumbnail = styled.img`
  height: 50px;
  display: block;
  width: 100%;
`;

const RemoveButton = styled.span`
  position: absolute;
  top: 1px;
  right: 1px;
  cursor: pointer;
`;

const ImageField = ({ value, onChange, uploadFile = () => {} }) => {
  const { t } = useTranslation();
  const [uploading, setUploading] = React.useState(false);

  let type, content;

  // Manage compat with
  if (typeof value === "object") {
    type = value.type;
    content = value.content;
  } else {
    if (value) {
      type = "external";
      content = value;
    } else {
      type = "empty";
      content = null;
    }
  }

  const onDrop = React.useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      setUploading(true);
      const location = await uploadFile(file);
      onChange(location);
      setUploading(false);
    },
    [onChange, uploadFile]
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleRemove = React.useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      onChange({ type: "empty", content: null });
      return false;
    },
    [onChange]
  );

  const handleInputChange = (e) => {
    onChange({ type, content: e.target.value });
  };

  const handleTypeChange = (e) => {
    console.log(e.target.value);
    onChange({ type: e.target.value, content });
  };

  const url = media2Url(value);
  console.log("tive", value, url, type);

  return (
    <div style={{ position: "relative" }}>
      {(type === "empty" || !content) && !uploading && <p>{t("No image")}</p>}
      {uploading && <p>{t("Sending file...")}</p>}
      {type !== "empty" && content && <Thumbnail src={url} />}
      {type !== "empty" && (
        <RemoveButton onClick={handleRemove}>X</RemoveButton>
      )}
      <label>
        <input
          type="radio"
          value="empty"
          onChange={handleTypeChange}
          checked={type === "empty"}
        />
        No image
      </label>
      <label>
        <input
          type="radio"
          value="local"
          onChange={handleTypeChange}
          checked={type === "local"}
        />
        Library
      </label>
      <label>
        <input
          type="radio"
          value="external"
          checked={type === "external"}
          onChange={handleTypeChange}
        />
        External
      </label>

      {type === "external" && (
        <input
          value={content}
          placeholder={t("Enter an image url...")}
          onChange={handleInputChange}
        />
      )}
      {type === "local" && (
        <div
          {...getRootProps()}
          style={{
            border: "3px dashed white",
            margin: "0.5em",
            padding: "0.5em",
            textAlign: "center",
          }}
        >
          <input {...getInputProps()} />
          <p>{t("Click or drag'n'drop file here")}</p>
        </div>
      )}
    </div>
  );
};

export default ImageField;
