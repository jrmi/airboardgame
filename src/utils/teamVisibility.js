export const UNASSIGNED_TEAM_ID = "players";
export const UNASSIGNED_TEAM = {
  id: UNASSIGNED_TEAM_ID,
  name: "Players",
};

export const getBoardTeams = (board = {}) => {
  const teams = Array.isArray(board.teams) ? board.teams : [];
  return teams.some(({ id }) => id === UNASSIGNED_TEAM_ID)
    ? teams
    : [UNASSIGNED_TEAM, ...teams];
};

export const canSeeItem = ({ item, userId, board, refereeView = false }) => {
  if (!item?.hidden) return true;
  if (refereeView) return true;
  const teamId = board?.teamAssignments?.[userId] || UNASSIGNED_TEAM_ID;
  return Boolean(item.hiddenForTeam && item.hiddenForTeam === teamId);
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
