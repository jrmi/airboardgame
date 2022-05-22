import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { MediaLibraryButton, media2Url } from "./";
import backgroundGrid from "../media/images/background-grid.png";

const StyledImageField = styled.div`
  & .typeSelect {
    padding: 0.5em;
  }
  & .imgContainer {
    margin: 0 1em;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 0.5em;
  }
`;

const Thumbnail = styled.img`
  max-height: 100px;
  display: block;
  background-image: url(${backgroundGrid});
`;

const ImageField = ({ value, onChange }) => {
  const { t } = useTranslation();
  let type, content;

  // Manage compat with old version
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

  const handleInputChange = (e) => {
    onChange({ ...value, type, content: e.target.value });
  };

  const handleTypeChange = (e) => {
    onChange({ ...value, type: e.target.value, content: "" });
  };

  const handleMediaSelect = (key) => {
    onChange({ ...value, type: "local", content: key });
  };

  const url = media2Url(value);

  return (
    <StyledImageField>
      <form className="typeSelect">
        <label>
          <input
            type="radio"
            value="empty"
            onChange={handleTypeChange}
            checked={type === "empty"}
          />
          {t("No image")}
        </label>
        <label>
          <input
            type="radio"
            value="local"
            onChange={handleTypeChange}
            checked={type === "local"}
          />
          {t("Library")}
        </label>
        <label>
          <input
            type="radio"
            value="external"
            checked={type === "external"}
            onChange={handleTypeChange}
          />
          {t("External")}
        </label>
      </form>

      <div className="imgContainer" onClick={(e) => e.preventDefault()}>
        {type !== "empty" && content && <Thumbnail src={url} />}

        {type === "external" && (
          <input
            value={content}
            placeholder={t("Enter an image url...")}
            onChange={handleInputChange}
          />
        )}
        {type === "local" && (
          <MediaLibraryButton
            onSelect={handleMediaSelect}
            label={content ? t("Change image") : t("Select image")}
          />
        )}
      </div>
    </StyledImageField>
  );
};

export default ImageField;
