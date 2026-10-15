import React from "react";
import { useItems } from "react-sync-board";

const holderTypes = new Set(["image", "advancedImage", "zone", "checkerboard"]);

const HeldItemRotationStyles = () => {
  const items = useItems();
  const heldIds = new Set();
  items.forEach((item) => {
    if (item.heldBy) heldIds.add(item.id);
    // Legacy games have flat links but no direct-owner metadata.
    if (holderTypes.has(item.type) && item.holdItems) {
      (item.linkedItems || []).forEach((id) => heldIds.add(id));
    }
  });
  if (!heldIds.size) return null;

  const selectors = [...heldIds].map(
    (id) => `.item[data-id=${JSON.stringify(String(id))}]`
  );
  return (
    <style>{`${selectors.join(",")} { transition: none !important; }`}</style>
  );
};

export default HeldItemRotationStyles;
