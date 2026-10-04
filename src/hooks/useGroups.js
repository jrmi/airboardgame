import React from "react";
import { useBoardConfig, useUsers } from "react-sync-board";

export const defaultGroups = [
  { id: "umpire", name: "Umpire" },
  { id: "player", name: "Player" },
];

// Earliest joiner of the current space is treated as the umpire by default,
// mirroring react-sync-board's own space-master election (see joinSpace /
// electSpaceMaster) so "first player" means the same thing here as it does
// for isSpaceMaster elsewhere in the app.
export const getFirstPlayerUid = (users) =>
  users.reduce((first, user) => {
    if (!first) return user;
    return (user.spaceJoinedTimestamp || 0) < (first.spaceJoinedTimestamp || 0)
      ? user
      : first;
  }, null)?.uid;

export const getGroupIdForUser = (user, groupAssignments, firstPlayerUid) =>
  groupAssignments[user.uid] ||
  (user.uid === firstPlayerUid ? "umpire" : "player");

// The current user's effective group id, taking into account explicit
// assignments (boardConfig.groupAssignments) and the default-umpire-for-
// first-player / default-player-for-others fallback.
export const useCurrentUserGroupId = () => {
  const [boardConfig] = useBoardConfig();
  const { currentUser, localUsers: users } = useUsers();
  const groupAssignments = boardConfig?.groupAssignments || {};

  const firstPlayerUid = React.useMemo(() => getFirstPlayerUid(users), [users]);

  return getGroupIdForUser(currentUser, groupAssignments, firstPlayerUid);
};

// Whether the current user can open the Groups panel: normal case is "you're
// in the Umpire group", but if the first player explicitly reassigns
// themself away from Umpire without anyone else taking their place, nobody
// would be able to reach the panel to fix that — so as a fallback, everyone
// can manage groups while the Umpire group is empty.
export const useCanManageGroups = () => {
  const [boardConfig] = useBoardConfig();
  const { currentUser, localUsers: users } = useUsers();
  const groupAssignments = boardConfig?.groupAssignments || {};

  const firstPlayerUid = React.useMemo(() => getFirstPlayerUid(users), [users]);

  const myGroupId = getGroupIdForUser(
    currentUser,
    groupAssignments,
    firstPlayerUid
  );
  const hasUmpire = users.some(
    (user) =>
      getGroupIdForUser(user, groupAssignments, firstPlayerUid) === "umpire"
  );

  return myGroupId === "umpire" || !hasUmpire;
};
