import React from "react";

import { useCurrentUserGroupId } from "../hooks/useGroups";
import useHiddenItemOpacity from "../hooks/useHiddenItemOpacity";

// Wraps every item template's component (see itemTemplates.js) so an item
// hidden via the "groupHide" action (useGameItemActions.jsx) is invisible to
// players outside its hiddenByGroup and the Umpire group, and shown at
// reduced opacity (this viewer's own hiddenItemOpacity setting, editable
// any time from the User details panel) to everyone who can see it --
// including the player who hid it. Applied centrally here rather than per
// item type so every current and future item gets the behavior for free.
const withGroupVisibility = (Component) => {
  const WithGroupVisibility = (props) => {
    const { hidden, hiddenByGroup } = props;
    const myGroupId = useCurrentUserGroupId();
    const [hiddenItemOpacity] = useHiddenItemOpacity();

    if (!hidden) {
      return <Component {...props} />;
    }

    if (myGroupId !== "umpire" && myGroupId !== hiddenByGroup) {
      return null;
    }

    return (
      <div style={{ opacity: hiddenItemOpacity }}>
        <Component {...props} />
      </div>
    );
  };
  WithGroupVisibility.displayName = `WithGroupVisibility(${
    Component.displayName || Component.name || "Component"
  })`;
  return WithGroupVisibility;
};

export default withGroupVisibility;
