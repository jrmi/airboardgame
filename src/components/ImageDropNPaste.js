import React from "react";

import Waiter from "./Waiter";
import { useDropzone } from "react-dropzone";
import { uploadImage } from "../utils/api";
import { PanZoomRotateAtom } from "./Board";
import { useItems } from "../components/Board/Items";
import { nanoid } from "nanoid";

import { useRecoilCallback } from "recoil";

const ImageDropNPaste = ({ children }) => {
  const [uploading, setUploading] = React.useState(false);
  const { pushItem } = useItems();

  const addImageItem = useRecoilCallback(
    ({ snapshot }) => async (location) => {
      const { centerX, centerY } = await snapshot.getPromise(PanZoomRotateAtom);
      pushItem({
        type: "image",
        x: centerX,
        y: centerY,
        id: nanoid(),
        content: location,
      });
    },
    [pushItem]
  );

  const onDrop = React.useCallback(
    async (acceptedFiles) => {
      setUploading(true);
      await Promise.all(
        acceptedFiles.map(async (file) => {
          const location = await uploadImage(file);
          await addImageItem(location);
        })
      );
      setUploading(false);
    },
    [addImageItem]
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
          const location = await uploadImage(file);
          await addImageItem(location);
        }
      }
      setUploading(false);
    },
    [addImageItem]
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
      {uploading && <Waiter message="Uploading image(s)..." />}
    </div>
  );
};

export default ImageDropNPaste;
