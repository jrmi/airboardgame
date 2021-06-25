import React from "react";
import { useDropzone } from "react-dropzone";
import { nanoid } from "nanoid";
import { useRecoilCallback } from "recoil";
import { useTranslation } from "react-i18next";

import { PanZoomRotateAtom } from "./board";
import { useItems } from "../components/board/Items";
import { useMediaLibrary } from "../components/mediaLibrary";
import Waiter from "./ui/Waiter";

const ImageDropNPaste = ({ children }) => {
  const { t } = useTranslation();
  const [uploading, setUploading] = React.useState(false);
  const { pushItem } = useItems();

  const { addMedia, libraries } = useMediaLibrary();

  const addImageItem = useRecoilCallback(
    ({ snapshot }) => async (media) => {
      const { centerX, centerY } = await snapshot.getPromise(PanZoomRotateAtom);
      pushItem({
        type: "image",
        x: centerX,
        y: centerY,
        id: nanoid(),
        content: media,
      });
    },
    [pushItem]
  );

  const onDrop = React.useCallback(
    async (acceptedFiles) => {
      setUploading(true);
      await Promise.all(
        acceptedFiles.map(async (file) => {
          const media = await addMedia(libraries[0], file);
          await addImageItem(media);
        })
      );
      setUploading(false);
    },
    [addImageItem, addMedia, libraries]
  );

  const { getRootProps } = useDropzone({ onDrop });

  const onPaste = React.useCallback(
    async (e) => {
      const items = e.clipboardData.items;
      setUploading(true);
      for (var i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf("image") !== -1) {
          const file = item.getAsFile();
          const location = await addMedia(libraries[0], file);
          await addImageItem(location);
        }
      }
      setUploading(false);
    },
    [addImageItem, addMedia, libraries]
  );

  React.useEffect(() => {
    window.addEventListener("paste", onPaste, false);

    return () => {
      window.removeEventListener("paste", onPaste);
    };
  }, [onPaste]);

  return (
    <div {...getRootProps()}>
      {children}
      {uploading && <Waiter message={t("Uploading image(s)...")} />}
    </div>
  );
};

export default ImageDropNPaste;
