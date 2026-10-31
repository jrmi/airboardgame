import React from "react";
import { createPortal } from "react-dom";
import { useBoardConfig, useItems, useUsers } from "react-sync-board";
import { FiLock } from "react-icons/fi";

import { useModeration } from "../../hooks/useModeration";
import { canSeeItem } from "../../utils/teamVisibility";
import { getItemElement } from "../../utils";

const TeamVisibilityLockOverlay = () => {
  const items = useItems();
  const [boardConfig] = useBoardConfig();
  const { currentUser } = useUsers();
  const { state, isModerator } = useModeration();
  const refereeView = isModerator && state.refereeView;
  const visibleItems = React.useMemo(
    () =>
      items.filter(
        (item) =>
          item.visibleOnlyForTeam &&
          canSeeItem({
            item,
            userId: currentUser?.uid,
            board: boardConfig,
            refereeView,
          })
      ),
    [boardConfig, currentUser?.uid, items, refereeView]
  );
  const [itemElements, setItemElements] = React.useState({});

  React.useLayoutEffect(() => {
    setItemElements(
      Object.fromEntries(
        visibleItems.map((item) => [item.id, getItemElement(item.id)])
      )
    );
  }, [visibleItems]);

  return visibleItems.map((item) => {
    const element = itemElements[item.id];
    if (!element) return null;

    return createPortal(
      <FiLock
        aria-hidden="true"
        size={18}
        style={{
          position: "absolute",
          zIndex: 1,
          top: "4px",
          right: "4px",
          color: "var(--color-accent-yellow)",
          pointerEvents: "none",
        }}
      />,
      element,
      item.id
    );
  });
};

export default TeamVisibilityLockOverlay;
