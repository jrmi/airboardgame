import React from "react";

import styled from "styled-components";
import { useTranslation } from "react-i18next";

import { ENABLE_WEBCONFERENCE } from "../../utils/settings";
import useLocalStorage from "../../hooks/useLocalStorage";
import useC2C from "../../hooks/useC2C";
import Touch from "../../ui/Touch";
import { UserList } from "../../components/users";

import WebConferenceButton from "../../components/webconf/WebConferenceButton";

import Brand from "../Brand";

const StyledNavBar = styled.div.attrs(() => ({ className: "nav" }))`
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 10;

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

      background-color: var(--color-blueGrey);
      box-shadow: 0px 3px 6px #00000029;

      line-height: 90px;
      letter-spacing: 0px;
      font-size: 24px;
      text-transform: uppercase;

      transform: perspective(280px) rotateX(-20deg);
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
  const { room } = useC2C("room");
  const [showLink, setShowLink] = React.useState(false);
  const [isBeta] = useLocalStorage("isBeta", false);

  return (
    <StyledNavBar>
      <div className="nav-left">
        <Brand />
      </div>

      <div className="nav-center">
        <h3>{"Air Board Game"}</h3>
      </div>

      <div className="nav-right">
        <UserList />
        {
          <Touch
            onClick={() => {
              setShowLink(true);
            }}
            icon="add-user"
            title={t("Invite more player")}
          />
        }
        {ENABLE_WEBCONFERENCE && isBeta && <WebConferenceButton room={room} />}
      </div>
    </StyledNavBar>
  );
};

export default RoomNavBar;
