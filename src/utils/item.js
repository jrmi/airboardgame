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

export const isItemCenterInsideElement = (itemElement, otherElem) => {
  const rect = otherElem.getBoundingClientRect();
  const itemCenter = getItemCenter(itemElement);
  return isPointInsideRect(itemCenter, rect);
};

export const areItemsInside = (
  element,
  itemIds,
  previousIds = [],
  centerOnly = false
) => {
  return Object.fromEntries(
    [...itemIds, ...previousIds].map((itemId) => {
      const inside = centerOnly
        ? isItemCenterInsideElement(getItemElement(itemId), element)
        : isItemInsideElement(getItemElement(itemId), element);

      return [
        itemId,
        {
          inside,
          added: inside && !previousIds.includes(itemId),
          removed: !inside && previousIds.includes(itemId),
        },
      ];
    })
  );
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

export const availableItemVisitor = async (items, callback) => {
  return await Promise.all(
    items.map(async (node) => {
      if (node.items) {
        return {
          ...node,
          items: await availableItemVisitor(node.items, callback),
        };
      } else {
        // It's an element
        return await callback(node);
      }
    })
  );
};

export const getHeldItems = ({
  element,
  currentItemId,
  currentLinkedItemIds,
  itemList,
  itemIds,
  shouldHoldItems,
}) => {
  if (shouldHoldItems) {
    let before = true;
    const afterItemIds = itemList
      .filter(({ id }) => {
        const result = !before && itemIds.includes(id);
        if (id === currentItemId) {
          before = false;
        }
        return result;
      })
      .map(({ id }) => id);
    const newHeldItems = Object.entries(
      areItemsInside(element, afterItemIds, currentLinkedItemIds || [], true)
    )
      .filter(([, { inside }]) => inside)
      .map(([itemId]) => itemId);
    if (
      currentLinkedItemIds.length !== newHeldItems.length ||
      !currentLinkedItemIds.every((itemId) => newHeldItems.includes(itemId))
    ) {
      return newHeldItems;
    }
  } else {
    if (
      !Array.isArray(currentLinkedItemIds) ||
      currentLinkedItemIds.length !== 0
    ) {
      return [];
    }
  }

  return currentLinkedItemIds;
};
