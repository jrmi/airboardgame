import React from "react";
import { useUsers } from "react-sync-board";

const normalizeName = (name) => (name || "").trim().toLowerCase();

const useUniqueUsername = () => {
  const { currentUser, updateCurrentUser, localUsers: users } = useUsers();

  React.useEffect(() => {
    if (!currentUser?.id || !currentUser.name) {
      return;
    }

    const currentName = currentUser.name.trim();
    const others = users.filter((user) => user.id !== currentUser.id);
    const conflicts = others.filter(
      (user) => normalizeName(user.name) === normalizeName(currentName)
    );

    // The user with the lexicographically smallest connection id keeps the
    // name. This gives every client the same winner without a rename race.
    if (
      conflicts.length === 0 ||
      !conflicts.some((user) => user.id < currentUser.id)
    ) {
      return;
    }

    const takenNames = new Set(others.map((user) => normalizeName(user.name)));
    let suffix = 2;
    let candidate = `${currentName} (${suffix})`;
    while (takenNames.has(normalizeName(candidate))) {
      suffix += 1;
      candidate = `${currentName} (${suffix})`;
    }

    updateCurrentUser({ name: candidate });
  }, [currentUser, updateCurrentUser, users]);
};

export default useUniqueUsername;
