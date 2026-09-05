import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { nanoid } from "nanoid";

import { useBoardConfig, useUsers } from "react-sync-board";

import NavButton from "../../ui/NavButton";
import SidePanel from "../../ui/SidePanel";
import {
  defaultGroups,
  getFirstPlayerUid,
  getGroupIdForUser,
} from "../../hooks/useGroups";

import { FiFlag, FiTrash2 } from "react-icons/fi";

const StyledRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5em;
  margin: 0.3em 0;

  & input {
    flex: 1;
  }
`;

const StyledUserRow = styled(StyledRow)`
  & .color-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex: 0 0 auto;
  }

  & .name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & select {
    flex: 1;
  }
`;

const GroupsPanel = ({ open, onClose }) => {
  const { t } = useTranslation();
  const [boardConfig, setBoardConfig] = useBoardConfig();
  const { localUsers: users } = useUsers();

  const groups = boardConfig?.groups || defaultGroups;
  const groupAssignments = boardConfig?.groupAssignments || {};

  const [newGroupName, setNewGroupName] = React.useState("");

  const firstPlayerUid = React.useMemo(() => getFirstPlayerUid(users), [users]);

  const handleAddGroup = React.useCallback(() => {
    const name = newGroupName.trim();
    if (!name) return;
    setBoardConfig((prev) => ({
      ...prev,
      groups: [...(prev.groups || defaultGroups), { id: nanoid(), name }],
    }));
    setNewGroupName("");
  }, [newGroupName, setBoardConfig]);

  const handleRenameGroup = React.useCallback(
    (groupId, name) => {
      setBoardConfig((prev) => ({
        ...prev,
        groups: (prev.groups || defaultGroups).map((group) =>
          group.id === groupId ? { ...group, name } : group
        ),
      }));
    },
    [setBoardConfig]
  );

  const handleRemoveGroup = React.useCallback(
    (groupId) => {
      setBoardConfig((prev) => ({
        ...prev,
        groups: (prev.groups || defaultGroups).filter(
          (group) => group.id !== groupId
        ),
        groupAssignments: Object.fromEntries(
          Object.entries(prev.groupAssignments || {}).filter(
            ([, assignedGroupId]) => assignedGroupId !== groupId
          )
        ),
      }));
    },
    [setBoardConfig]
  );

  const handleAssign = React.useCallback(
    (userUid, groupId) => {
      setBoardConfig((prev) => ({
        ...prev,
        groupAssignments: {
          ...(prev.groupAssignments || {}),
          [userUid]: groupId,
        },
      }));
    },
    [setBoardConfig]
  );

  return (
    <SidePanel open={open} onClose={onClose} title={t("Groups")} width="25%">
      <section>
        <header>
          <h3>{t("Groups")}</h3>
        </header>
        {groups.map((group) => (
          <StyledRow key={group.id}>
            <input
              value={group.name}
              onChange={(e) => handleRenameGroup(group.id, e.target.value)}
            />
            {group.id !== "umpire" && group.id !== "player" && (
              <button
                className="button clear icon-only"
                onClick={() => handleRemoveGroup(group.id)}
                title={t("Remove group")}
                alt={t("Remove group")}
              >
                <FiTrash2 />
              </button>
            )}
          </StyledRow>
        ))}
        <StyledRow>
          <input
            value={newGroupName}
            placeholder={t("Group name")}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddGroup();
            }}
          />
          <button className="button" onClick={handleAddGroup}>
            {t("Add group")}
          </button>
        </StyledRow>
      </section>
      <section>
        <header>
          <h3>{t("Players")}</h3>
        </header>
        {users.map((user) => (
          <StyledUserRow key={user.uid}>
            <div
              className="color-dot"
              style={{ backgroundColor: user.color }}
            />
            <span className="name">{user.name}</span>
            <select
              value={getGroupIdForUser(user, groupAssignments, firstPlayerUid)}
              onChange={(e) => handleAssign(user.uid, e.target.value)}
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </StyledUserRow>
        ))}
      </section>
    </SidePanel>
  );
};

const GroupsButton = ({ showGroupsPanel, setShowGroupsPanel }) => {
  const { t } = useTranslation();

  return (
    <>
      <NavButton
        onClick={() => setShowGroupsPanel((prev) => !prev)}
        alt={t("Groups")}
        title={t("Groups")}
        Icon={FiFlag}
      />
      <GroupsPanel
        open={showGroupsPanel}
        onClose={() => setShowGroupsPanel(false)}
      />
    </>
  );
};

export default GroupsButton;
