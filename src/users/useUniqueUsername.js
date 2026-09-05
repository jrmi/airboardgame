import React from "react";
import { useUsers } from "react-sync-board";

// Auto-disambiguate on join: if another user already sharing the current
// space (room or session) has this exact name (e.g. everyone defaults to
// "Player", or two tabs on the same machine share a persisted name), pick a
// unique variant instead of silently colliding. Only the higher-id side of a
// collision renames, so two clients don't race to the same new name.
const useUniqueUsername = () => {
  const { currentUser, updateCurrentUser, localUsers: users } = useUsers();

  React.useEffect(() => {
    if (!currentUser?.id || !currentUser.name) {
      return;
    }
    const currentName = currentUser.name.trim();
    const others = users.filter((u) => u.id !== currentUser.id);
    const conflicting = others.filter(
      (u) => (u.name || "").trim().toLowerCase() === currentName.toLowerCase()
    );
    if (
      conflicting.length === 0 ||
      !conflicting.some((u) => u.id < currentUser.id)
    ) {
      return;
    }
    const takenNames = new Set(
      others.map((u) => (u.name || "").trim().toLowerCase())
    );
    let suffix = 2;
    let candidate = `${currentName} (${suffix})`;
    while (takenNames.has(candidate.toLowerCase())) {
      suffix += 1;
      candidate = `${currentName} (${suffix})`;
    }
    updateCurrentUser({ name: candidate });
  }, [users, currentUser, updateCurrentUser]);
};

export default useUniqueUsername;
