import React from "react";
import { useUsers } from "react-sync-board";
import styled from "styled-components";
import { FaCrown, FaGavel } from "react-icons/fa";
import { useTranslation } from "react-i18next";

import UserConfig from "./UserConfig";
import { UNASSIGNED_TEAM_ID } from "../utils/teamVisibility";

const InlineUserList = styled.ul.attrs(() => ({ className: "uk-card" }))`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const InlineUserListItem = styled.li`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  &.user-list__item--with-name {
    flex-direction: row;
    gap: 0.6em;
    width: 100%;
    padding: 0.35em 0.5em;
  }
`;

const UserTeamHeading = styled.li`
  padding: 0.55em 0.5em 0.2em;
  color: var(--color-board-muted, #aab5c4);
  font-size: 0.85em;
  font-weight: 700;
`;

export const Users = ({
  showNames = false,
  moderatorId,
  moderatorWaiting,
  refereeView,
  teams,
  teamAssignments,
  onAssignTeam,
}) => {
  const { t } = useTranslation();
  const { currentUser, updateCurrentUser, localUsers: users } = useUsers();

  const renderUser = (u, index) => (
    <InlineUserListItem
      className={showNames ? "user-list__item--with-name" : undefined}
      key={u.id}
    >
      <UserConfig
        index={index + 1}
        user={u}
        updateCurrentUser={updateCurrentUser}
        editable={currentUser.id === u.id}
        showName={showNames}
        teams={teams}
        assignedTeam={teamAssignments?.[u.uid || u.id] || "players"}
        onAssignTeam={
          onAssignTeam && ((teamId) => onAssignTeam(u.uid || u.id, teamId))
        }
      />
      {(u.uid || u.id) === moderatorId &&
        (refereeView ? (
          <FaGavel
            aria-label={t("Referee view is active")}
            title={t("Referee view is active")}
            role="img"
            style={{ color: "#d93636", flexShrink: 0 }}
          />
        ) : (
          <FaCrown
            aria-label={t("Moderator")}
            title={
              moderatorWaiting
                ? `${t("Moderator")} — ${t("Waiting for reconnection")}`
                : t("Moderator")
            }
            role="img"
            style={{ color: "#f4c542", flexShrink: 0 }}
          />
        ))}
    </InlineUserListItem>
  );

  const usersGroupedByTeam =
    showNames && teams?.length
      ? [
          ...teams.filter(({ id }) => id !== UNASSIGNED_TEAM_ID),
          ...teams.filter(({ id }) => id === UNASSIGNED_TEAM_ID),
        ].flatMap((team) => {
          const members = users
            .map((user, index) => ({ user, index }))
            .filter(({ user }) => {
              const assigned = teamAssignments?.[user.uid || user.id];
              const knownTeam = teams.some(({ id }) => id === assigned);
              const effectiveTeam = knownTeam ? assigned : UNASSIGNED_TEAM_ID;
              return effectiveTeam === team.id;
            });
          if (!members.length) return [];
          return [
            <UserTeamHeading key={`team-${team.id}`}>
              {team.id === UNASSIGNED_TEAM_ID ? t("Unassigned") : team.name}
            </UserTeamHeading>,
            ...members.map(({ user, index }) => renderUser(user, index)),
          ];
        })
      : users.map(renderUser);

  return <InlineUserList>{usersGroupedByTeam}</InlineUserList>;
};

export default Users;
