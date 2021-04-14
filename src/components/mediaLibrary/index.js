import { API_BASE } from "../../utils/settings";

export { default as MediaLibraryProvider } from "./MediaLibraryProvider";
export { useMediaLibrary } from "./MediaLibraryProvider";
export { default as MediaLibraryButton } from "./MediaLibraryButton";
export { default as ImageField } from "./ImageField";

export const media2Url = (value) => {
  if (value && typeof value === "object") {
    switch (value.type) {
      case "local":
        return `${API_BASE}/${value.content}`;
      case "external":
        return value.content;
      case "dataUrl":
        return value.content;
      case "empty":
        return null;
      default:
      // do nothing
    }
  }
  return value;
};
