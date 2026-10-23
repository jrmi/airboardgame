import React from "react";
import { confirmAlert } from "react-confirm-alert";
import { useBoardConfig } from "react-sync-board";
import { useTranslation } from "react-i18next";
import { FiLink, FiMessageSquare, FiMic, FiUsers } from "react-icons/fi";
import styled from "styled-components";

import UserList from "../../../users/UserList";
import UserBar from "../UserBar";
import { MenuBadge, MenuItem, TopMenu } from "./Menu";
import { useModeration } from "../../../hooks/useModeration";
import { getBoardTeams, UNASSIGNED_TEAM } from "../../../utils/teamVisibility";

const MenuSection = styled.section`
  padding: 0.65rem 0.75rem;
  border-top: 1px solid var(--color-board-border);

  > strong {
    display: block;
    margin-bottom: 0.4rem;
  }
`;

const MenuDivider = styled.hr`
  border: 0;
  border-top: 1px solid var(--color-board-border);
  margin: 0.35rem 0;
`;

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
  const teams = getBoardTeams(boardConfig);

  React.useEffect(() => {
    if (isModerator && !Array.isArray(boardConfig.teams)) {
      setBoardConfig({
        ...boardConfig,
        teams: [UNASSIGNED_TEAM],
        teamAssignments: boardConfig.teamAssignments || {},
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

  const chooseTransferTarget = React.useCallback(() => {
    const candidates = users.filter(({ uid }) => uid !== state.moderatorId);
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="react-confirm-alert-body transfer-moderation-dialog">
          <h1 className="transfer-moderation-title">
            {t("Transfer moderation...")}
          </h1>
          <p className="transfer-moderation-description">
            {t("Select a player")}
          </p>
          <div className="transfer-moderation-options">
            {candidates.map((user) => (
              <button
                className="button"
                key={user.uid}
                type="button"
                onClick={() => {
                  onClose();
                  runModerationAction(() => transfer(user.uid));
                }}
              >
                {user.name || t("Player")}
              </button>
            ))}
            <button className="button" type="button" onClick={onClose}>
              {t("Cancel")}
            </button>
          </div>
        </div>
      ),
    });
  }, [runModerationAction, state.moderatorId, t, transfer, users]);

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
          teams={teams}
          teamAssignments={boardConfig.teamAssignments}
          onAssignTeam={
            isModerator
              ? (userId, teamId) =>
                  setBoardConfig({
                    ...boardConfig,
                    teamAssignments: {
                      ...boardConfig.teamAssignments,
                      [userId]: teamId,
                    },
                  })
              : undefined
          }
        />
      </div>
      {(!state.moderatorId || isModerator) && (
        <MenuSection
          aria-label={t("Moderator")}
          className="moderation-controls"
          aria-live="polite"
        >
          {state.moderatorId ? (
            <>
              <MenuItem onClick={toggleRefereeView}>
                {state.refereeView
                  ? t("Turn off referee view")
                  : t("Turn on referee view")}
              </MenuItem>
              {users.some(({ uid }) => uid !== state.moderatorId) && (
                <MenuItem onClick={chooseTransferTarget}>
                  {t("Transfer moderation...")}
                </MenuItem>
              )}
            </>
          ) : (
            <MenuItem onClick={() => runModerationAction(claim)}>
              {t("Take moderator role")}
            </MenuItem>
          )}
        </MenuSection>
      )}
      <MenuDivider />
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
