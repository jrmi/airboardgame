import React from "react";
import { FiLock } from "react-icons/fi";

import { canSeeItem } from "../../utils/teamVisibility";

export const createTeamVisibilityItemWrapper = ({
  userId,
  board,
  refereeView,
}) => {
  const TeamVisibilityItemWrapper = ({ item, children }) => {
    if (!item.visibleOnlyForTeam) return children;

    const visible = canSeeItem({ item, userId, board, refereeView });

    return (
      <div
        className={visible ? "team-limited-item" : undefined}
        style={{
          position: "relative",
          display: "inline-block",
          visibility: visible ? "visible" : "hidden",
          pointerEvents: visible ? "auto" : "none",
        }}
      >
        {children}
        {visible && (
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
          />
        )}
      </div>
    );
  };

  TeamVisibilityItemWrapper.displayName = "TeamVisibilityItemWrapper";
  return TeamVisibilityItemWrapper;
};
