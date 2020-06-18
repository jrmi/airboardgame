import React from "react";
import { useDropzone } from "react-dropzone";

const LoadGame = ({ onLoad = () => {} }) => {
  const onDrop = React.useCallback(
    (acceptedFiles) => {
      acceptedFiles.forEach((file) => {
        const reader = new FileReader();

        reader.onabort = () => console.log("file reading was aborted");
        reader.onerror = () => console.log("file reading has failed");
        reader.onload = () => {
          try {
            const result = JSON.parse(reader.result);
            onLoad(result);
          } catch (e) {
            console.log("File parsing failed", e);
          }
        };
        reader.readAsText(file);
      });
    },
    [onLoad]
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <p>Drag 'n' drop some files here, or click to select files</p>
    </div>
  );
};

export default LoadGame;
