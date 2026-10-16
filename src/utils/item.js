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
      const elementToTest = getItemElement(itemId);
      if (!elementToTest) {
        return [itemId, { inside: false, added: false, removed: true }];
      }
      const inside = centerOnly
        ? isItemCenterInsideElement(elementToTest, element)
        : isItemInsideElement(elementToTest, element);

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
  const safeCurrentLinkedItems = Array.isArray(currentLinkedItemIds)
    ? currentLinkedItemIds
    : [];

  if (shouldHoldItems) {
    const currentItemIndex = itemList.findIndex(
      ({ id }) => id === currentItemId
    );
    const currentItemLayer = itemList[currentItemIndex].layer || 0;

    const afterMap = Object.fromEntries(
      itemList.map(({ id, layer = 0 }, index) => {
        return [
          id,
          layer > currentItemLayer ||
            (layer === currentItemLayer && index > currentItemIndex),
        ];
      })
    );
    const afterItemIds = itemIds.filter((id) => afterMap[id]);

    const afterCurrentLinkedItemIds = (currentLinkedItemIds || []).filter(
      (id) => afterMap[id]
    );

    const newHeldItems = Object.entries(
      areItemsInside(element, afterItemIds, afterCurrentLinkedItemIds, true)
    )
      .filter(([, { inside }]) => inside)
      .map(([itemId]) => itemId);

    const oldLinked = new Set(safeCurrentLinkedItems);
    const newLinked = new Set(newHeldItems);

    if (
      newLinked.size !== oldLinked.size ||
      !Array.from(oldLinked).every((id) => newLinked.has(id))
    ) {
      return newHeldItems;
    }
  } else {
    if (safeCurrentLinkedItems.length !== 0) {
      return safeCurrentLinkedItems;
    }
  }

  return currentLinkedItemIds;
};

export const normalizeAngle = (angle) => ((angle % 360) + 360) % 360;

// CSS interpolates numeric rotate() values, not orientations. Keep the target
// in the current revolution so crossing zero takes the short path.
export const getContinuousRotation = (current = 0, target = 0) => {
  const delta = normalizeAngle(target - current + 180) - 180;
  return current + delta;
};

const roundPosition = (value) => {
  const rounded = Math.round(value * 100) / 100;
  return rounded === 0 ? 0 : rounded;
};

const itemCenter = (item, dimensions) => ({
  x: item.x + dimensions[item.id].width / 2,
  y: item.y + dimensions[item.id].height / 2,
});

// linkedItems deliberately remains a flat list for backwards compatibility.
// This returns the one direct owner for each item: the visually topmost holder
// that currently contains it.
export const getHeldOwners = ({ items, dimensions, linkedItems = {} }) => {
  const owners = {};
  items.forEach((child) => {
    const candidates = items
      .map((holder, index) => ({ holder, index }))
      .filter(({ holder }) => {
        const links = linkedItems[holder.id] || holder.linkedItems || [];
        return (
          holder.id !== child.id &&
          holder.holdItems === true &&
          links.includes(child.id) &&
          dimensions[holder.id] &&
          dimensions[child.id]
        );
      })
      .sort(
        (a, b) =>
          (b.holder.layer || 0) - (a.holder.layer || 0) || b.index - a.index
      );
    if (candidates.length) owners[child.id] = candidates[0].holder.id;
  });
  return owners;
};

// Called after every placement by all hold-capable components. It refreshes
// references for every item still held by this holder, while assigning the
// reference to the deterministic immediate owner when holders overlap.
export const getHeldReferenceUpdates = ({
  holderId,
  linkedItems,
  itemList,
}) => {
  const dimensions = Object.fromEntries(
    itemList.map((item) => {
      const element = getItemElement(item.id);
      return [
        item.id,
        element && { width: element.clientWidth, height: element.clientHeight },
      ];
    })
  );
  const owners = getHeldOwners({
    items: itemList,
    dimensions,
    linkedItems: { [holderId]: linkedItems },
  });
  const byId = new Map(itemList.map((item) => [item.id, item]));
  const updates = {};
  (linkedItems || []).forEach((childId) => {
    const ownerId = owners[childId];
    const child = byId.get(childId);
    const owner = byId.get(ownerId);
    if (!child || !owner || !dimensions[childId] || !dimensions[ownerId])
      return;
    const childCenter = itemCenter(child, dimensions);
    const ownerCenter = itemCenter(owner, dimensions);
    updates[childId] = {
      heldBy: ownerId,
      heldOffset: {
        x: childCenter.x - ownerCenter.x,
        y: childCenter.y - ownerCenter.y,
      },
      heldAngle: normalizeAngle(owner.rotation || 0),
    };
  });
  return updates;
};

// Pure held-stack transform. `dimensions` is an id -> { width, height } map,
// so callers can obtain dimensions from the DOM without coupling this logic to
// React or the board implementation.
export const getHeldRotationUpdates = ({
  items,
  dimensions,
  rootAngleDeltas,
}) => {
  const byId = new Map(items.map((item) => [item.id, item]));
  const legacyOwners = getHeldOwners({ items, dimensions });
  const ownerOf = (item) => {
    const recordedOwner = byId.get(item.heldBy);
    if (
      recordedOwner?.holdItems === true &&
      recordedOwner.linkedItems?.includes(item.id)
    ) {
      return item.heldBy;
    }
    return legacyOwners[item.id];
  };
  const selected = new Set(Object.keys(rootAngleDeltas));
  const roots = Object.keys(rootAngleDeltas).filter((id) => {
    let ownerId = ownerOf(byId.get(id) || {});
    const seen = new Set();
    while (ownerId && !seen.has(ownerId)) {
      if (selected.has(ownerId)) return false;
      seen.add(ownerId);
      ownerId = ownerOf(byId.get(ownerId) || {});
    }
    return true;
  });
  const updates = {};
  const pose = (id) =>
    updates[id] ? { ...byId.get(id), ...updates[id] } : byId.get(id);
  const visit = (holderId, angleDelta) => {
    const holder = pose(holderId);
    if (!holder || !dimensions[holderId]) return;
    const holderCenter = itemCenter(holder, dimensions);
    const children = items.filter((item) => ownerOf(item) === holderId);
    children.forEach((child) => {
      if (updates[child.id]) return;
      const childPose = pose(child.id);
      const reference =
        child.heldBy === holderId && child.heldOffset
          ? child.heldOffset
          : {
              x: itemCenter(childPose, dimensions).x - holderCenter.x,
              y: itemCenter(childPose, dimensions).y - holderCenter.y,
            };
      const referenceAngle =
        child.heldBy === holderId && child.heldOffset
          ? child.heldAngle || 0
          : holder.rotation || 0;
      const nextRotation = (childPose.rotation || 0) + angleDelta;
      const holderRotation = updates[holderId]
        ? holder.rotation || 0
        : normalizeAngle((holder.rotation || 0) + angleDelta);
      const radians = ((holderRotation - referenceAngle) * Math.PI) / 180;
      const center = {
        x:
          holderCenter.x +
          reference.x * Math.cos(radians) -
          reference.y * Math.sin(radians),
        y:
          holderCenter.y +
          reference.x * Math.sin(radians) +
          reference.y * Math.cos(radians),
      };
      updates[child.id] = {
        x: roundPosition(center.x - dimensions[child.id].width / 2),
        y: roundPosition(center.y - dimensions[child.id].height / 2),
        rotation: nextRotation,
      };
      visit(child.id, angleDelta);
    });
  };
  roots.forEach((id) => visit(id, rootAngleDeltas[id]));
  return { roots, updates };
};
