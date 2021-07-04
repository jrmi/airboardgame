import Diacritics from "diacritic";

const cleanWord = (word) => Diacritics.clean(word).toLowerCase();

export const search = (term, string) => {
  let strings = string;
  if (typeof string === "string") {
    strings = [string];
  }
  const cleanedTerm = cleanWord(term);
  return strings.some((s) => cleanWord(s).includes(cleanedTerm));
};

export const media2Url = (value, apiBase) => {
  if (value && typeof value === "object") {
    switch (value.type) {
      case "local":
        return `${apiBase}/${value.content}`;
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
