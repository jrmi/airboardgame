import {
  rectRadius,
  isPointInsideRect,
  isPointInPolygon,
  distance,
} from "./geometry";

export const isItemInsideElement = (itemElement, otherElem) => {
  const rect = otherElem.getBoundingClientRect();
  const fourElem = Array.from(itemElement.querySelectorAll(".corner"));
  return fourElem.every((corner) => {
    const { top: y, left: x } = corner.getBoundingClientRect();
    return isPointInsideRect({ x, y }, rect);
  });
};

export const pointInItem = (itemElement, point) => {
  return isPointInPolygon(point, getItemPolygon(itemElement));
};

export const getItemPolygon = (itemElement, asArray = false) => {
  const fourElem = Array.from(itemElement.querySelectorAll(".corner"));
  if (asArray) {
    return fourElem.map((corner) => {
      const { top: y, left: x } = corner.getBoundingClientRect();
      return [x, y];
    });
  }
  return fourElem.map((corner) => {
    const { top: y, left: x } = corner.getBoundingClientRect();
    return { x, y };
  });
};

export const getItemCenter = (itemElement) => {
  const center = Array.from(itemElement.querySelectorAll(".center"))[0];
  const { top: y, left: x } = center.getBoundingClientRect();
  return { x, y };
};

export const fastItemIntersect = (item1, item2) => {
  const p1 = getItemPolygon(item1);
  const c1 = getItemCenter(item1);
  const p2 = getItemPolygon(item2);
  const c2 = getItemCenter(item2);

  const r1 = rectRadius(p1, c1);
  const r2 = rectRadius(p2, c2);
  const dist = distance(c1, c2);

  return dist <= r1 + r2;
};

export const getItemElement = (id) => {
  const elem = document.getElementsByClassName(`item ${id}`)[0];
  if (!elem) {
    console.warn(`Missing element for id ${id}`);
  }
  return elem;
};