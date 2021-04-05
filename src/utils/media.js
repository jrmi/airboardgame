import { API_BASE } from "./settings";

export const media2Url = (value) => {
  if (typeof content === "object") {
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
