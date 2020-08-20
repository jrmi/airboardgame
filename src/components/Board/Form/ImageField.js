import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

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

  const handleChange = React.useCallback(
    async ({ target }) => {
      setUploading(true);
      const payload = new FormData();
      payload.append("file", target.files[0]);
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
      <input type="file" onChange={handleChange} />
    </div>
  );
};

export default ImageField;
