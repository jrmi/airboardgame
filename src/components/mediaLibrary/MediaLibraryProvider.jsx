import React, { useContext } from "react";
import { uploadResourceImage } from "../../utils/api";
import { listResourceImage } from "../../utils/api";

export const MediaLibraryContext = React.createContext({});

export const MediaLibraryProvider = ({ children, libraries = [] }) => {
  const addMedia = React.useCallback(async ({ boxId, resourceId }, file) => {
    const filePath = await uploadResourceImage(boxId, resourceId, file);
    return {
      type: "local",
      content: filePath,
    };
  }, []);

  const getLibraryMedia = React.useCallback(
    async ({ boxId, resourceId }) => listResourceImage(boxId, resourceId),
    []
  );

  return (
    <MediaLibraryContext.Provider
      value={{ addMedia, getLibraryMedia, libraries }}
    >
      {children}
    </MediaLibraryContext.Provider>
  );
};

export const useMediaLibrary = () => {
  return useContext(MediaLibraryContext);
};

export default MediaLibraryProvider;
