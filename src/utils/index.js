import Diacritics from "diacritic";
import { customAlphabet } from "nanoid";

const cleanWord = (word) => Diacritics.clean(word).toLowerCase();

export const search = (term, string) => {
  let strings = string;
  if (typeof string === "string") {
    strings = [string];
  }
  const cleanedTerm = cleanWord(term);
  return strings.some((s) => cleanWord(s).includes(cleanedTerm));
};

export const hasClass = (element, className) =>
  element.classList && element.classList.contains(className);

export const insideClass = (element, className) => {
  if (hasClass(element, className)) {
    return element;
  }
  if (!element.parentNode) {
    return false;
  }
  return insideClass(element.parentNode, className);
};

/**
 * Shuffles array in place.
 * @param {Array} a An array containing the items.
 */
export const shuffle = (a) => {
  // eslint-disable-next-line no-plusplus
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // eslint-disable-next-line no-param-reassign
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const randInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const isPointInsideRect = (point, rect) =>
  point.x > rect.left &&
  point.x < rect.left + rect.width &&
  point.y > rect.top &&
  point.y < rect.top + rect.height;

export const isItemInsideElement = (itemElement, otherElem) => {
  const rect = otherElem.getBoundingClientRect();
  const fourElem = Array.from(itemElement.querySelectorAll(".corner"));
  return fourElem.every((corner) => {
    const { top: y, left: x } = corner.getBoundingClientRect();
    return isPointInsideRect({ x, y }, rect);
  });
};

const alpha = "23456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";

// Custom uid generator
export const uid = customAlphabet(alpha, 10);

// Custom small uid generator
export const smallUid = customAlphabet(alpha, 5);
