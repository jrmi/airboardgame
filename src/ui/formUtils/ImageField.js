import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { useDropzone } from "react-dropzone";
import { uploadImage } from "../../utils/api";
import { useGame } from "../../hooks/useGame";

const Thumbnail = styled.img`
  height: 50px;
`;

const RemoveButton = styled.span`
  position: absolute;
  top: 1px;
  right: 1px;
`;

const ImageField = ({ value, onChange }) => {
  const { t } = useTranslation();
  const [uploading, setUploading] = React.useState(false);
  const { gameId } = useGame();

  const onDrop = React.useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      setUploading(true);
      const location = await uploadImage(gameId, file);
      onChange(location);
      setUploading(false);
    },
    [gameId, onChange]
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

  const handleInputChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div style={{ position: "relative" }}>
      {!value && !uploading && <p>{t("No image")}</p>}
      {uploading && <p>{t("Sending file...")}</p>}
      {value && <Thumbnail src={value} />}
      {value && <RemoveButton onClick={handleRemove}>X</RemoveButton>}
      <input value={value} onChange={handleInputChange} />
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
    </div>
  );
};

export default ImageField;
