export const INITIAL_GROUP_ID = "players";
export const INITIAL_GROUP = { id: INITIAL_GROUP_ID, name: "Players" };

export const getBoardGroups = (board = {}) => {
  const groups = Array.isArray(board.groups) ? board.groups : [];
  return groups.some(({ id }) => id === INITIAL_GROUP_ID)
    ? groups
    : [INITIAL_GROUP, ...groups];
};

export const canSeeItem = ({ item, userId, board, refereeView = false }) => {
  if (!item?.hidden) return true;
  if (refereeView) return true;
  const groupId = board?.groupAssignments?.[userId] || INITIAL_GROUP_ID;
  return Boolean(item.hiddenByGroup && item.hiddenByGroup === groupId);
};

export const getLinkedItemIds = (items, rootIds) => {
  const itemById = new Map(items.map((item) => [item.id, item]));
  const ids = new Set();
  const pending = [...rootIds];
  while (pending.length) {
    const id = pending.pop();
    if (ids.has(id)) continue;
    ids.add(id);
    (itemById.get(id)?.linkedItems || []).forEach((linkedId) =>
      pending.push(linkedId)
    );
  }
  return [...ids].filter((id) => itemById.has(id));
};
