import React from "react";

import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useWire } from "react-sync-board";

import Touch from "../../ui/Touch";
import UserList from "../../users/UserList";
import WebConferenceButton from "../../webconf/WebConferenceButton";
import InviteModal from "./InviteModal";

import Brand from "../Brand";
import { useLocation } from "react-router-dom";

const StyledNavBar = styled.div.attrs(() => ({ className: "nav" }))`
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 205;

  background-color: #19202ce0;
  box-shadow: 0px 3px 6px #00000029;

  color: var(--font-color);

  & .nav-center {
    display: relative;
    & h3 {
      position: absolute;
      top: 0;
      margin: 0;
      padding: 0 2em;

      background-color: transparent;

      line-height: 6rem;
      letter-spacing: 0px;
      font-size: 24px;
      text-transform: uppercase;
    }
  }

  & .nav-right,
  & .nav-center,
  & .nav-left {
    align-items: center;
  }

  & .nav-left {
    & > div {
      //flex: 1;
      padding-right: 1em;
    }
    padding-left: 40px;
    justify-content: flex-start;
  }

  & .nav-right {
    justify-content: flex-end;
    padding-right: 1em;
    gap: 1em;
  }

  & .spacer {
    flex: 1;
    max-width: 1em;
  }

  @media screen and (max-width: 640px) {
    & .nav-center h3 {
      position: relative;
      padding: 0;

      background-color: transparent;
      box-shadow: none;
      line-height: 1.2em;
      font-size: 1.2em;
      transform: none;
    }

    & .nav-right {
      display: none;
    }

    & .spacer {
      flex: 0;
    }

    & {
      flex-direction: row;
    }
    & .save {
      display: none;
    }
    & .info {
      margin: 0;
      padding: 0;
      width: 24px;
      height: 24px;
    }
    & .help {
      margin: 0;
      padding: 0;
      width: 24px;
      height: 24px;
    }
    & h3 {
      font-size: 1.2em;
    }
    & .nav-left {
      flex: 0;
    }
  }
`;

const RoomNavBar = () => {
  const { t } = useTranslation();
  const { room } = useWire("room");
  const { state } = useLocation();

  const [showInvite, setShowInvite] = React.useState(
    state ? state.showInvite : undefined
  );

  return (
    <StyledNavBar>
      <div className="nav-left">
        <Brand />
      </div>

      <div className="nav-center">
        <h3>{t("Choose your board")}</h3>
      </div>

      <div className="nav-right">
        <UserList />
        {
          <Touch
            onClick={() => {
              setShowInvite(true);
            }}
            icon="add-user"
            title={t("Invite more player")}
          />
        }
        <WebConferenceButton room={room} />
      </div>
      <InviteModal show={showInvite} setShow={setShowInvite} />
    </StyledNavBar>
  );
};

export default RoomNavBar;
