import React from "react";
import { confirmAlert } from "react-confirm-alert";
import { useBoardConfig, useItems } from "react-sync-board";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import {
  FiLink,
  FiMessageSquare,
  FiMic,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";
import styled from "styled-components";

import UserList from "../../../users/UserList";
import UserBar from "../UserBar";
import { MenuBadge, MenuItem, TopMenu } from "./Menu";
import { useModeration } from "../../../hooks/useModeration";
import useLocalStorage from "../../../hooks/useLocalStorage";
import {
  getBoardGroups,
  INITIAL_GROUP,
  INITIAL_GROUP_ID,
} from "../../../utils/itemVisibility";

const MenuSection = styled.section`
  padding: 0.65rem 0.75rem;
  border-top: 1px solid var(--color-board-border);

  > strong {
    display: block;
    margin-bottom: 0.4rem;
  }
`;

const CampRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0.35rem 0;

  input {
    flex: 1;
    min-width: 0;
  }
`;

const GroupManager = ({ boardConfig, setBoardConfig }) => {
  const { t } = useTranslation();
  const items = useItems();
  const { isModerator } = useModeration();
  const groups = getBoardGroups(boardConfig);

  if (!isModerator) return null;

  const updateGroups = (nextGroups, groupAssignments) =>
    setBoardConfig((previous) => ({
      ...previous,
      groups: nextGroups,
      groupAssignments: groupAssignments || previous.groupAssignments || {},
    }));

  return (
    <MenuSection aria-label={t("Manage camps")}>
      <strong>{t("Camps")}</strong>
      {groups
        .filter(({ id }) => id !== INITIAL_GROUP_ID)
        .map((group) => (
          <CampRow key={group.id}>
            <input
              aria-label={t("Camp name")}
              value={
                group.id === INITIAL_GROUP_ID &&
                group.name === INITIAL_GROUP.name
                  ? t("Users")
                  : group.name
              }
              onChange={(event) => {
                const name = event.target.value;
                setBoardConfig((previous) => ({
                  ...previous,
                  groups: getBoardGroups(previous).map((candidate) =>
                    candidate.id === group.id
                      ? { ...candidate, name }
                      : candidate
                  ),
                }));
              }}
            />
            {group.id !== INITIAL_GROUP_ID && (
              <MenuItem
                $keepMenuOpen
                aria-label={t("Delete camp")}
                title={t("Delete camp")}
                style={{ width: "auto", flex: "0 0 auto", padding: "0.5em" }}
                onClick={() => {
                  if (
                    items.some(
                      (item) => item.hidden && item.hiddenByGroup === group.id
                    )
                  ) {
                    toast.error(
                      t(
                        "This camp still owns hidden items. Make them public first."
                      )
                    );
                    return;
                  }
                  const assignments = Object.fromEntries(
                    Object.entries(boardConfig.groupAssignments || {}).map(
                      ([userId, assignedGroup]) => [
                        userId,
                        assignedGroup === group.id
                          ? INITIAL_GROUP_ID
                          : assignedGroup,
                      ]
                    )
                  );
                  updateGroups(
                    groups.filter((candidate) => candidate.id !== group.id),
                    assignments
                  );
                }}
              >
                <FiTrash2 size={16} aria-hidden="true" />
              </MenuItem>
            )}
          </CampRow>
        ))}
      <MenuItem
        $keepMenuOpen
        onClick={() => {
          const nextNumber =
            groups.reduce((largest, group) => {
              const suffix = Number(group.name.match(/(\d+)$/)?.[1] || 0);
              return Math.max(largest, suffix);
            }, groups.length - 1) + 1;
          updateGroups([
            ...groups,
            {
              id: `group-${Date.now()}`,
              name: t("Team {{number}}", { number: nextNumber }),
            },
          ]);
        }}
      >
        {t("Create camp")}
      </MenuItem>
    </MenuSection>
  );
};

const HiddenItemOpacity = () => {
  const { t } = useTranslation();
  const [opacity, setOpacity] = useLocalStorage("hiddenItemOpacity", 0.28);
  return (
    <label style={{ display: "block", padding: "0.5em 0.75em" }}>
      {t("Hidden item opacity")}
      <input
        type="range"
        min="0.1"
        max="1"
        step="0.05"
        value={opacity}
        onChange={(event) => setOpacity(Number(event.target.value))}
      />
    </label>
  );
};

const UsersMenu = ({
  activeMenu,
  setActiveMenu,
  users,
  notificationCount,
  onUnreadMessageCountChange,
}) => {
  const { t } = useTranslation();
  const { state, isModerator, claim, transfer, setRefereeView } =
    useModeration();
  const [boardConfig, setBoardConfig] = useBoardConfig();
  const groups = getBoardGroups(boardConfig);

  React.useEffect(() => {
    if (isModerator && !Array.isArray(boardConfig.groups)) {
      setBoardConfig({
        ...boardConfig,
        groups: [INITIAL_GROUP],
        groupAssignments: boardConfig.groupAssignments || {},
      });
    }
  }, [boardConfig, isModerator, setBoardConfig]);

  const runModerationAction = React.useCallback(
    (action) => action().catch(() => {}),
    []
  );

  const toggleRefereeView = React.useCallback(() => {
    confirmAlert({
      title: t("Confirmation"),
      message: state.refereeView
        ? t("Turn off referee view?")
        : t("Turn on referee view? Everyone will be notified."),
      buttons: [
        {
          label: t("Yes"),
          onClick: () =>
            runModerationAction(() => setRefereeView(!state.refereeView)),
        },
        { label: t("No"), onClick: () => {} },
      ],
    });
  }, [runModerationAction, setRefereeView, state.refereeView, t]);

  return (
    <TopMenu
      Icon={FiUsers}
      label={t("player", { count: users.length })}
      notificationCount={notificationCount}
      activeMenu={activeMenu}
      setActiveMenu={setActiveMenu}
      wide
    >
      <div data-close-mobile-menu>
        <UserList
          showNames
          moderatorId={state.moderatorId}
          moderatorWaiting={Boolean(state.reconnectUntil)}
          refereeView={state.refereeView}
          groups={groups}
          groupAssignments={boardConfig.groupAssignments}
          onAssignGroup={
            isModerator
              ? (userId, groupId) =>
                  setBoardConfig({
                    ...boardConfig,
                    groupAssignments: {
                      ...boardConfig.groupAssignments,
                      [userId]: groupId,
                    },
                  })
              : undefined
          }
        />
      </div>
      <MenuSection
        aria-label={t("Moderator")}
        className="moderation-controls"
        aria-live="polite"
      >
        {state.moderatorId ? (
          <>
            {isModerator ? (
              <>
                <MenuItem onClick={toggleRefereeView}>
                  {state.refereeView
                    ? t("Turn off referee view")
                    : t("Turn on referee view")}
                </MenuItem>
                {users
                  .filter(({ uid }) => uid !== state.moderatorId)
                  .map((user) => (
                    <MenuItem
                      key={user.uid}
                      onClick={() =>
                        runModerationAction(() => transfer(user.uid))
                      }
                    >
                      {t("Transfer moderator role to {{name}}", {
                        name: user.name,
                      })}
                    </MenuItem>
                  ))}
              </>
            ) : null}
          </>
        ) : (
          <MenuItem onClick={() => runModerationAction(claim)}>
            {t("Take moderator role")}
          </MenuItem>
        )}
      </MenuSection>
      <GroupManager boardConfig={boardConfig} setBoardConfig={setBoardConfig} />
      <HiddenItemOpacity />
      <UserBar
        onUnreadMessageCountChange={onUnreadMessageCountChange}
        renderMenuItems={({ openInvitation, renderChat, renderConference }) => (
          <>
            <MenuItem onClick={openInvitation}>
              <FiLink size={16} aria-hidden="true" />
              {t("Invite more player")}
            </MenuItem>
            {renderChat((onClick) => (
              <MenuItem onClick={onClick}>
                <FiMessageSquare size={16} aria-hidden="true" />
                {t("Chat")}
                {notificationCount > 0 && (
                  <MenuBadge $notification>
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </MenuBadge>
                )}
              </MenuItem>
            ))}
            {renderConference((onClick) => (
              <MenuItem onClick={onClick}>
                <FiMic size={16} aria-hidden="true" />
                {t("Web conference")}
              </MenuItem>
            ))}
          </>
        )}
      />
    </TopMenu>
  );
};

export default UsersMenu;
