import React from "react";
import { useUsers } from "react-sync-board";
import styled from "styled-components";
import { FaCrown, FaGavel } from "react-icons/fa";
import { useTranslation } from "react-i18next";

import UserConfig from "./UserConfig";

const INITIAL_GROUP_ID = "players";

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

const UserGroupHeading = styled.li`
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
  groups,
  groupAssignments,
  onAssignGroup,
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
        groups={groups}
        assignedGroup={groupAssignments?.[u.uid || u.id] || "players"}
        onAssignGroup={
          onAssignGroup && ((groupId) => onAssignGroup(u.uid || u.id, groupId))
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

  const groupedUsers =
    showNames && groups?.length
      ? [
          ...groups.filter(({ id }) => id !== INITIAL_GROUP_ID),
          ...groups.filter(({ id }) => id === INITIAL_GROUP_ID),
        ].flatMap((group) => {
          const members = users
            .map((user, index) => ({ user, index }))
            .filter(({ user }) => {
              const assigned = groupAssignments?.[user.uid || user.id];
              const knownGroup = groups.some(({ id }) => id === assigned);
              const effectiveGroup = knownGroup ? assigned : INITIAL_GROUP_ID;
              return effectiveGroup === group.id;
            });
          if (!members.length) return [];
          return [
            <UserGroupHeading key={`group-${group.id}`}>
              {group.id === INITIAL_GROUP_ID ? t("Unassigned") : group.name}
            </UserGroupHeading>,
            ...members.map(({ user, index }) => renderUser(user, index)),
          ];
        })
      : users.map(renderUser);

  return <InlineUserList>{groupedUsers}</InlineUserList>;
};

export default Users;
