import Diacritics from "diacritic";

/**
 * Check if element or parent has className.
 * @param {DOMElement} element
 * @param {string} className
 */
export const hasClass = (element, className) =>
  typeof element.className === "string" &&
  element.className.split(" ").includes(className);

export const insideClass = (element, className) => {
  if (hasClass(element, className)) {
    return element;
  }
  if (!element.parentNode) {
    return false;
  }
  return insideClass(element.parentNode, className);
};

export const isPointInsideRect = (point, rect) => {
  return (
    point.x > rect.left &&
    point.x < rect.left + rect.width &&
    point.y > rect.top &&
    point.y < rect.top + rect.height
  );
};

export const isItemInsideElement = (itemElement, otherElem) => {
  const rect = otherElem.getBoundingClientRect();
  const fourElem = Array.from(itemElement.querySelectorAll(".corner"));
  return fourElem.every((corner) => {
    const { top: y, left: x } = corner.getBoundingClientRect();
    return isPointInsideRect({ x, y }, rect);
  });
};

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
export const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const randInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const cleanWord = (word) => {
  return Diacritics.clean(word).toLowerCase();
};

export const search = (term, string) => {
  let strings = string;
  if (typeof string === "string") {
    strings = [string];
  }
  const cleanedTerm = cleanWord(term);
  return strings.some((s) => cleanWord(s).includes(cleanedTerm));
};
