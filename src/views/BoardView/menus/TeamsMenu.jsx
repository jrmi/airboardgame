import React from "react";
import { useTranslation } from "react-i18next";
import { useBoardConfig, useItems } from "react-sync-board";
import { toast } from "react-toastify";
import { FiEdit2, FiFlag, FiTrash2 } from "react-icons/fi";
import styled from "styled-components";

import { useModeration } from "../../../hooks/useModeration";
import {
  getBoardTeams,
  UNASSIGNED_TEAM_ID,
} from "../../../utils/teamVisibility";
import { MenuItem, TopMenu } from "./Menu";

const TeamRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0.35rem 0;

  input {
    flex: 1;
    min-width: 0;
  }
`;

const TeamName = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const EditNameButton = styled.button`
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  padding: 0.35rem;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: inherit;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const TeamManagerSection = styled.section`
  padding: 0.65rem 0.75rem;

  > strong {
    display: block;
    margin-bottom: 0.4rem;
  }
`;

const TeamManager = ({ boardConfig, setBoardConfig }) => {
  const { t } = useTranslation();
  const items = useItems();
  const teams = getBoardTeams(boardConfig);
  const [editingTeamId, setEditingTeamId] = React.useState(null);
  const [draftName, setDraftName] = React.useState("");
  const skipBlurSave = React.useRef(false);

  const updateTeamName = (teamId, name) =>
    setBoardConfig((previous) => ({
      ...previous,
      teams: getBoardTeams(previous).map((candidate) =>
        candidate.id === teamId ? { ...candidate, name } : candidate
      ),
    }));

  const saveTeamName = (team) => {
    if (skipBlurSave.current) {
      skipBlurSave.current = false;
      return;
    }
    updateTeamName(team.id, draftName.trim() || team.name);
    setEditingTeamId(null);
  };

  const updateTeams = (nextTeams, teamAssignments) =>
    setBoardConfig((previous) => ({
      ...previous,
      teams: nextTeams,
      teamAssignments: teamAssignments || previous.teamAssignments || {},
    }));

  return (
    <TeamManagerSection aria-label={t("Manage teams")}>
      <strong>{t("Teams")}</strong>
      {teams
        .filter(({ id }) => id !== UNASSIGNED_TEAM_ID)
        .map((team) => (
          <TeamRow key={team.id}>
            {editingTeamId === team.id ? (
              <input
                aria-label={t("Team name")}
                autoFocus
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                onBlur={() => saveTeamName(team)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.currentTarget.blur();
                  if (event.key === "Escape") {
                    skipBlurSave.current = true;
                    setEditingTeamId(null);
                  }
                }}
              />
            ) : (
              <TeamName>{team.name}</TeamName>
            )}
            {editingTeamId !== team.id && (
              <EditNameButton
                type="button"
                aria-label={t("Team name")}
                title={t("Team name")}
                onClick={() => {
                  setDraftName(team.name);
                  setEditingTeamId(team.id);
                }}
              >
                <FiEdit2 size={15} aria-hidden="true" />
              </EditNameButton>
            )}
            <MenuItem
              $keepMenuOpen
              aria-label={t("Delete team")}
              title={t("Delete team")}
              style={{ width: "auto", flex: "0 0 auto", padding: "0.5em" }}
              onClick={() => {
                if (
                  items.some(
                    (item) => item.hidden && item.hiddenForTeam === team.id
                  )
                ) {
                  toast.error(
                    t(
                      "This team still owns hidden items. Make them public first."
                    )
                  );
                  return;
                }
                const assignments = Object.fromEntries(
                  Object.entries(boardConfig.teamAssignments || {}).map(
                    ([userId, assignedTeam]) => [
                      userId,
                      assignedTeam === team.id
                        ? UNASSIGNED_TEAM_ID
                        : assignedTeam,
                    ]
                  )
                );
                updateTeams(
                  teams.filter((candidate) => candidate.id !== team.id),
                  assignments
                );
              }}
            >
              <FiTrash2 size={16} aria-hidden="true" />
            </MenuItem>
          </TeamRow>
        ))}
      <MenuItem
        $keepMenuOpen
        onClick={() => {
          const nextNumber =
            teams.reduce((largest, team) => {
              const suffix = Number(team.name.match(/(\d+)$/)?.[1] || 0);
              return Math.max(largest, suffix);
            }, teams.length - 1) + 1;
          updateTeams([
            ...teams,
            {
              id: `team-${Date.now()}`,
              name: t("Team {{number}}", { number: nextNumber }),
            },
          ]);
        }}
      >
        {t("Add a team")}
      </MenuItem>
    </TeamManagerSection>
  );
};

const TeamsMenu = ({ activeMenu, setActiveMenu }) => {
  const { t } = useTranslation();
  const { isModerator } = useModeration();
  const [boardConfig, setBoardConfig] = useBoardConfig();

  if (!isModerator) return null;

  return (
    <TopMenu
      Icon={FiFlag}
      label={t("Teams")}
      activeMenu={activeMenu}
      setActiveMenu={setActiveMenu}
      wide
    >
      <TeamManager boardConfig={boardConfig} setBoardConfig={setBoardConfig} />
    </TopMenu>
  );
};

export default TeamsMenu;
