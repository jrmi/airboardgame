import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "react-query";
import styled from "styled-components";

import { API_BASE } from "../../utils/settings";
import backgroundGrid from "../../images/background-grid.png";

import Modal from "../../ui/Modal";

import { useMediaLibrary } from ".";
import { useDropzone } from "react-dropzone";

const ImageGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  & img {
    height: 100px;
    margin: 0.5em;
    cursor: pointer;
    border: 1px solid transparent;
    background-image: url(${backgroundGrid});
    &:hover {
      filter: brightness(1.2);
      border: 1px dotted var(--color-primary);
    }
  }
`;

const MediaLibraryModal = ({ show, setShow, onSelect }) => {
  const { t } = useTranslation();

  const { getLibraryMedia, addMedia, libraries } = useMediaLibrary();

  const queryClient = useQueryClient();
  const [tab, setTab] = React.useState(libraries[0].id);

  const currentLibrary = libraries.find(({ id }) => id === tab);

  const { isLoading, data = [] } = useQuery(
    `media__${tab}`,
    () => getLibraryMedia(currentLibrary),
    {
      enabled: show,
    }
  );

  const handleSelect = React.useCallback(
    (media) => {
      onSelect(media);
      setShow(false);
    },
    [onSelect, setShow]
  );

  const uploadMediaMutation = useMutation(
    async (files) => {
      if (files.length === 1) {
        return [await addMedia(currentLibrary, files[0])];
      } else {
        return Promise.all(files.map((file) => addMedia(currentLibrary, file)));
      }
    },
    {
      onSuccess: (result) => {
        if (result.length === 1) {
          // If only one file is processed
          handleSelect(result[0].content);
        }
        queryClient.invalidateQueries(`media__${tab}`);
      },
    }
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: uploadMediaMutation.mutate,
  });

  return (
    <Modal
      title={t("Media library")}
      show={show}
      setShow={setShow}
      position="left"
    >
      <nav className="tabs">
        {libraries.map(({ id, name }) => (
          <a
            onClick={() => setTab(id)}
            className={tab === id ? "active" : ""}
            style={{ cursor: "pointer" }}
            key={id}
          >
            {name}
          </a>
        ))}
      </nav>

      <section>
        {libraries.map(({ id, name }, index) => {
          if (tab === id) {
            return (
              <>
                {index === 0 && (
                  <>
                    <h3>{t("Add file")}</h3>
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
                  </>
                )}
                <h3>{name}</h3>
                {!isLoading && (
                  <ImageGrid>
                    {data.map((key) => (
                      <img
                        src={`${API_BASE}/${key}`}
                        key={key}
                        onClick={() => handleSelect(key)}
                      />
                    ))}
                  </ImageGrid>
                )}
              </>
            );
          } else {
            return null;
          }
        })}
      </section>
    </Modal>
  );
};

export default MediaLibraryModal;
