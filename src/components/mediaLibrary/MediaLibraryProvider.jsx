import React, { useContext } from "react";
import {
  uploadResourceImage,
  listResourceImage,
  deleteResourceImage,
} from "../../utils/api";

export const MediaLibraryContext = React.createContext({});

export const MediaLibraryProvider = ({ children, libraries = [] }) => {
  const addMedia = React.useCallback(async ({ boxId, resourceId }, file) => {
    const filePath = await uploadResourceImage(boxId, resourceId, file);
    return {
      type: "local",
      content: filePath,
    };
  }, []);

  const removeMedia = React.useCallback(async (key) => {
    return await deleteResourceImage(key);
  }, []);

  const getLibraryMedia = React.useCallback(
    async ({ boxId, resourceId }) => listResourceImage(boxId, resourceId),
    []
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
