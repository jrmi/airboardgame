export const UNASSIGNED_TEAM_ID = "__no_team__";
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
  if (!item?.visibleOnlyForTeam) return true;
  if (refereeView) return true;
  const teamId = board?.teamAssignments?.[userId] || UNASSIGNED_TEAM_ID;
  return item.visibleOnlyForTeam === teamId;
};
