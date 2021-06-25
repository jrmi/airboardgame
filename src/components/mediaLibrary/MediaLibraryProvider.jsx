import React, { useContext } from "react";

export const MediaLibraryContext = React.createContext({});

const noop = () => {};

export const MediaLibraryProvider = ({
  children,
  libraries = [],
  uploadMedia = noop,
  listMedia = noop,
  deleteMedia = noop,
}) => {
  const addMedia = React.useCallback(
    async ({ boxId, resourceId }, file) => {
      const filePath = await uploadMedia(boxId, resourceId, file);
      return {
        type: "local",
        content: filePath,
      };
    },
    [uploadMedia]
  );

  const removeMedia = React.useCallback(
    async (key) => {
      return await deleteMedia(key);
    },
    [deleteMedia]
  );

  const getLibraryMedia = React.useCallback(
    async ({ boxId, resourceId }) => listMedia(boxId, resourceId),
    [listMedia]
  );

  return (
    <MediaLibraryContext.Provider
      value={{ addMedia, getLibraryMedia, libraries, removeMedia }}
    >
      {children}
    </MediaLibraryContext.Provider>
  );
};

export const useMediaLibrary = () => {
  return useContext(MediaLibraryContext);
};

export default MediaLibraryProvider;
