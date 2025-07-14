import React, { useContext } from "react";
import {
  uploadResourceImage as uploadMedia,
  deleteResourceImage as deleteMedia,
  listResourceImage as listMedia,
} from "../utils/api";

export const MediaLibraryContext = React.createContext({});

export const MediaLibraryProvider = ({ children, libraries = [] }) => {
  const addMedia = React.useCallback(async ({ boxId, resourceId }, file) => {
    const filePath = await uploadMedia(boxId, resourceId, file);
    console.log(filePath);
    return {
      type: "local",
      content: filePath,
    };
  }, []);

  const removeMedia = React.useCallback(async ({ boxId, resourceId }, key) => {
    return await deleteMedia(boxId, resourceId, key);
  }, []);

  const getLibraryMedia = React.useCallback(
    async ({ boxId, resourceId }) => listMedia(boxId, resourceId),
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
